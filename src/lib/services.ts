



import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { adminDb } from './firebase-admin';
import { FieldValue, FieldPath } from 'firebase-admin/firestore';
import type { Category, Provider, Review, Request, Prediction, StandbyPrediction } from './types';
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
 * Adds a new provider to Firestore with 'pending' status. Uses Admin SDK.
 */
export async function addProvider(
    data: { name: string; serviceId: string; phone: string; whatsapp: string; location: object; imageId: string; digitalAddress: string; }
) {
    await adminDb.collection('providers').add({
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      location: data.location,
      serviceId: data.serviceId,
      imageId: data.imageId,
      digitalAddress: data.digitalAddress,
      status: "pending",
      verified: false,
      isFeatured: false,
      rating: 0,
      reviewCount: 0,
      createdAt: FieldValue.serverTimestamp()
    });
    
    return { success: true };
}

/**
 * Adds a new review to Firestore with 'pending' status for moderation. Uses Admin SDK.
 */
export async function addReview(data: Omit<Review, 'id' | 'createdAt' | 'status'>) {
    await adminDb.collection('reviews').add({
      ...data,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp()
    });
    return { success: true };
}

/**
 * Fetches the list of zones for Berekum from Firestore using the client SDK.
 */
export async function getBerekumZones(): Promise<string[]> {
    // NOTE: Returning static data to ensure dropdown is populated.
    return BEREKUM_ZONES;
}

/**
 * Fetches all data needed for the admin dashboard.
 */
export async function getDashboardData() {
    try {
        // Fetch live counts for the stat cards
        const [
            providersSnap,
            pendingProvidersSnap,
            requestsSnap,
            activeServicesSnap
        ] = await Promise.all([
            adminDb.collection('providers').count().get(),
            adminDb.collection('providers').where('status', '==', 'pending').count().get(),
            adminDb.collection('requests').count().get(),
            adminDb.collection('services').where('active', '==', true).count().get()
        ]);

        const totalProviders = providersSnap.data().count;
        const pendingProviders = pendingProvidersSnap.data().count;
        const totalRequests = requestsSnap.data().count;
        const activeServices = activeServicesSnap.data().count;
        
        // Fetch live standby and prediction data
        const predictionDoc = await adminDb.collection('predictions').doc('tomorrow').get();
        const predictionData = predictionDoc.data();
        const prediction: Prediction | null = predictionDoc.exists && predictionData ? { 
            ...predictionData, 
            generatedAt: predictionData.generatedAt.toDate().toISOString() 
        } as Prediction : null;

        const standbyDoc = await adminDb.collection('standby').doc('tomorrow').get();
        let standby: StandbyPrediction | null = null;
        if (standbyDoc.exists) {
            const standbyData = standbyDoc.data()!;
            const artisanIds = (standbyData.artisans || []) as string[];
            let standbyArtisans: Provider[] = [];

            if (artisanIds.length > 0) {
                 // Fetch provider details in a single query
                const providersSnap = await adminDb.collection('providers').where(FieldPath.documentId(), 'in', artisanIds).get();
                const providersMap = new Map<string, Provider>();
                providersSnap.forEach(doc => {
                    const data = doc.data();
                    providersMap.set(doc.id, {
                        id: doc.id,
                        name: data.name ?? 'Unknown',
                        phone: data.phone ?? '',
                    } as Provider);
                });
                standbyArtisans = artisanIds.map(id => providersMap.get(id)).filter(Boolean) as Provider[];
            }

            standby = {
                serviceType: standbyData.serviceType,
                area: standbyData.area,
                artisans: standbyArtisans,
                generatedAt: standbyData.generatedAt.toDate().toISOString(),
            };
        }

        // Keep using mock data for charts and other stats for now
        const { REQUESTS } = await import('./data');
        const whatsappMessages = 250; // Mock value
        const failedMessages = 15; // Mock value

        const serviceCounts = REQUESTS.reduce((acc, req) => {
            acc[req.serviceType] = (acc[req.serviceType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const locationCounts = REQUESTS.reduce((acc, req) => {
            acc[req.location] = (acc[req.location] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const serviceChartData = Object.entries(serviceCounts).map(([name, total]) => ({ name, total }));
        const locationChartData = Object.entries(locationCounts).map(([name, total]) => ({ name, total }));

        return {
            totalProviders,
            pendingProviders,
            activeServices,
            totalRequests,
            whatsappMessages,
            failedMessages,
            serviceChartData,
            locationChartData,
            prediction,
            standby,
        };
    } catch (error) {
        console.error('CRITICAL: Could not generate dashboard data.', error);
        // Fallback to all zeros if Firestore fails
        return {
            totalProviders: 0,
            pendingProviders: 0,
            activeServices: 0,
            totalRequests: 0,
            whatsappMessages: 0,
            failedMessages: 0,
            serviceChartData: [],
            locationChartData: [],
            prediction: null,
            standby: null,
        };
    }
}
