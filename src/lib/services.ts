import { adminDb } from './firebase-admin';
import type { Category, Provider, Review } from './types';
import { getCategories, PROVIDERS, REVIEWS } from './data';

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
 * Fetches approved providers from Firestore, optionally filtering by category slug, using the Admin SDK.
 * Featured providers are always listed first.
 */
export async function getProviders(categorySlug?: string): Promise<Provider[]> {
    const db = adminDb;
    // Robust check: Fallback to mock data if adminDb is missing or not fully initialized (common during build)
    if (!db || typeof db.collection !== 'function') {
        console.warn('Firebase Admin SDK not available. Falling back to mock provider data.');
        let providers = PROVIDERS.filter(p => p.status === 'approved');
        if (categorySlug && categorySlug !== 'all') {
            // In mock data, serviceId is the slug
            providers = providers.filter(p => p.serviceId === categorySlug);
        }
        return providers.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    try {
        const servicesSnap = await db.collection('services').get();
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
        
        let providersQuery = db.collection('providers').where('status', '==', 'approved');

        if (serviceIdForSlug) {
            providersQuery = providersQuery.where('serviceId', '==', serviceIdForSlug);
        }
        
        const providersSnap = await providersQuery.get();

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
        .filter(p => p.location?.city === 'Berekum');

        return providers.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    } catch (e) {
        console.error("Error in getProviders:", e);
        return [];
    }
}

/**
 * Fetches a single approved provider by its ID from Firestore using the Admin SDK.
 */
export async function getProviderById(id: string): Promise<Provider | undefined> {
    const db = adminDb;
    if (!db || typeof db.collection !== 'function') {
        console.warn('Firebase Admin SDK not available. Falling back to mock provider data.');
        return PROVIDERS.find(p => p.id === id && p.status === 'approved');
    }

    try {
        const providerRef = db.collection('providers').doc(id);
        const providerDoc = await providerRef.get();
        if (!providerDoc.exists()) {
            return undefined;
        }
        const data = providerDoc.data()!;

        if (data.status !== 'approved') {
            return undefined;
        }

        let categoryName = 'N/A';
        if (data.serviceId) {
            const serviceDoc = await db.collection('services').doc(data.serviceId).get();
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
    } catch (e) {
        console.error("Error in getProviderById:", e);
        return undefined;
    }
}

/**
 * Fetches all approved reviews for a specific provider from Firestore using the Admin SDK.
 */
export async function getReviewsByProviderId(providerId: string): Promise<Review[]> {
    const db = adminDb;
    if (!db || typeof db.collection !== 'function') {
        console.warn('Firebase Admin SDK not available. Falling back to mock review data.');
        return REVIEWS.filter(r => r.providerId === providerId && r.status === 'approved');
    }

    try {
        const reviewsQuery = db.collection('reviews')
            .where('providerId', '==', providerId)
            .where('status', '==', 'approved')
            .orderBy('createdAt', 'desc');
            
        const reviewsSnap = await reviewsQuery.get();
        
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
    } catch (e) {
        console.error("Error in getReviewsByProviderId:", e);
        return [];
    }
}
