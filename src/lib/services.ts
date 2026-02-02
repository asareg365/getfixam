import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Category, Provider, Review } from './types';
import { cache } from 'react';
import { BEREKUM_ZONES, CATEGORIES } from './data';

/**
 * Fetches all active categories from Firestore using the client SDK.
 * This function is cached to ensure data consistency across server components.
 */
export const getCategories = cache(async (): Promise<Category[]> => {
    // NOTE: Returning static data for now to ensure dropdowns are populated.
    return CATEGORIES.sort((a, b) => a.name.localeCompare(b.name));
});

/**
 * Fetches a category by its slug from the cached list of categories.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  if (slug === 'all') {
    return { id: 'all', name: 'All Artisans', slug: 'all', icon: 'Wrench' };
  }
  
  // Use the cached function to avoid redundant database calls
  const categories = await getCategories();
  return categories.find(category => category.slug === slug);
}

/**
 * Fetches approved providers from Firestore, optionally filtering by category slug, using the client SDK.
 * Featured providers are always listed first.
 */
export async function getProviders(categorySlug?: string): Promise<Provider[]> {
    const servicesRef = collection(db, 'services');
    const servicesSnap = await getDocs(servicesRef);
    const servicesMap = new Map<string, { name: string, slug: string }>();
    let serviceIdForSlug: string | null = null;
    servicesSnap.forEach(doc => {
        const data = doc.data();
        servicesMap.set(doc.id, { name: data.name, slug: data.slug });
        if (categorySlug && data.slug === categorySlug) {
            serviceIdForSlug = doc.id;
        }
    });

    if (categorySlug && categorySlug !== 'all' && !serviceIdForSlug) {
        return [];
    }
    
    const providersRef = collection(db, 'providers');
    
    const queryConstraints = [
        where('status', '==', 'approved')
    ];

    if (serviceIdForSlug) {
        queryConstraints.push(where('serviceId', '==', serviceIdForSlug));
    }
    
    const q = query(providersRef, ...queryConstraints);
    
    const providersSnap = await getDocs(q);

    let providers = providersSnap.docs.map(doc => {
        const data = doc.data();
        const service = servicesMap.get(data.serviceId);
        return {
            id: doc.id,
            name: data.name ?? 'Unknown',
            category: service?.name ?? 'N/A',
            serviceId: data.serviceId,
            phone: data.phone,
            whatsapp: data.whatsapp,
            digitalAddress: data.digitalAddress ?? '',
            location: data.location,
            status: data.status,
            verified: data.verified,
            isFeatured: data.isFeatured ?? false,
            rating: data.rating ?? 0,
            reviewCount: data.reviewCount ?? 0,
            createdAt: data.createdAt?.toDate().toISOString() ?? new Date(0).toISOString(),
            approvedAt: data.approvedAt?.toDate().toISOString(),
            featuredUntil: data.featuredUntil?.toDate().toISOString(),
            imageId: data.imageId,
        } as Provider;
    })
    // We still filter for city client-side to avoid needing another composite index.
    .filter(p => p.location?.city === 'Berekum');

    return providers.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
}

/**
 * Fetches a single approved provider by its ID from Firestore using the client SDK.
 */
export async function getProviderById(id: string): Promise<Provider | undefined> {
    const providerRef = doc(db, 'providers', id);
    const providerDoc = await getDoc(providerRef);
    if (!providerDoc.exists()) {
        return undefined;
    }
    const data = providerDoc.data()!;

    if (data.status !== 'approved') {
        return undefined;
    }

    let categoryName = 'N/A';
    if (data.serviceId) {
        const serviceDoc = await getDoc(doc(db, 'services', data.serviceId));
        if (serviceDoc.exists()) {
            categoryName = serviceDoc.data()!.name;
        }
    }

    return {
        id: providerDoc.id,
        name: data.name,
        category: categoryName,
        serviceId: data.serviceId,
        phone: data.phone,
        whatsapp: data.whatsapp,
        digitalAddress: data.digitalAddress ?? '',
        location: data.location,
        status: data.status,
        verified: data.verified,
        isFeatured: data.isFeatured ?? false,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        createdAt: data.createdAt?.toDate().toISOString() ?? new Date(0).toISOString(),
        approvedAt: data.approvedAt?.toDate().toISOString(),
        featuredUntil: data.featuredUntil?.toDate().toISOString(),
        imageId: data.imageId,
    } as Provider;
}

/**
 * Fetches all approved reviews for a specific provider from Firestore using the client SDK.
 */
export async function getReviewsByProviderId(providerId: string): Promise<Review[]> {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef,
        where('providerId', '==', providerId),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
    );
    const reviewsSnap = await getDocs(q);
    
    if (reviewsSnap.empty) {
        return [];
    }

    return reviewsSnap.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            providerId: data.providerId,
            userName: data.userName,
            rating: data.rating,
            comment: data.comment,
            createdAt: data.createdAt?.toDate().toISOString() ?? new Date(0).toISOString(),
            userImageId: data.userImageId,
            status: data.status,
        } as Review;
    });
}

/**
 * Fetches the list of zones for Berekum from Firestore using the client SDK.
 */
export async function getBerekumZones(): Promise<string[]> {
    // NOTE: Returning static data to ensure dropdown is populated.
    return BEREKUM_ZONES;
}
