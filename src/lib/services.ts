import { adminDb } from './firebase-admin';
import type { Category, Provider } from './types';
import { getCategories, CATEGORIES } from './data';

/**
 * Fetches a category by its slug.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  if (slug === 'all') {
    return { id: 'all', name: 'All Artisans', slug: 'all', icon: 'Wrench' };
  }
  
  const categories = await getCategories();
  return categories.find(category => category.slug === slug);
}

/**
 * Fetches providers from Firestore. 
 * Includes both 'approved' and 'pending' statuses for better platform visibility during growth.
 */
export async function getProviders(categorySlug?: string): Promise<Provider[]> {
    const db = adminDb;
    if (!db || typeof db.collection !== 'function') {
        return [];
    }

    try {
        // 1. Fetch all services to map IDs to Names and Slugs
        const servicesSnap = await db.collection('services').get();
        const servicesMap = new Map<string, { name: string, slug: string }>();
        let serviceIdFromSlug: string | null = null;
        
        servicesSnap.forEach(doc => {
            const data = doc.data();
            servicesMap.set(doc.id, { name: data.name, slug: data.slug });
            if (categorySlug && data.slug === categorySlug) {
                serviceIdFromSlug = doc.id;
            }
        });

        // 2. Build Query - Include pending to help user see their new listings
        let providersQuery = db.collection('providers').where('status', 'in', ['approved', 'pending']);

        // 3. Apply category filter if not 'all'
        if (categorySlug && categorySlug !== 'all') {
            if (serviceIdFromSlug) {
                providersQuery = providersQuery.where('serviceId', '==', serviceIdFromSlug);
            } else {
                // Fallback: Check if providers were added with the slug itself as the ID (static fallback)
                providersQuery = providersQuery.where('serviceId', '==', categorySlug);
            }
        }
        
        const providersSnap = await providersQuery.get();

        let providers = providersSnap.docs.map(doc => {
            const data = doc.data();
            const service = servicesMap.get(data.serviceId);
            
            // Map category name from Firestore or Fallback to static data
            let categoryName = service?.name;
            if (!categoryName) {
                const staticCat = CATEGORIES.find(c => c.id === data.serviceId || c.slug === data.serviceId);
                categoryName = staticCat?.name || data.serviceId || 'Artisan';
            }

            // Safe date parsing
            let createdAt = new Date().toISOString();
            try {
                if (data.createdAt?.toDate) createdAt = data.createdAt.toDate().toISOString();
                else if (data.createdAt) createdAt = new Date(data.createdAt).toISOString();
            } catch (e) {}

            return {
                id: doc.id,
                name: data.name ?? 'Unknown Artisan',
                category: categoryName,
                serviceId: data.serviceId,
                phone: data.phone ?? '',
                whatsapp: data.whatsapp ?? '',
                digitalAddress: data.digitalAddress ?? '',
                location: data.location ?? { region: 'Bono', city: 'Berekum', zone: 'Central' },
                status: data.status ?? 'pending',
                verified: data.verified ?? false,
                isFeatured: data.isFeatured ?? false,
                rating: data.rating ?? 0,
                reviewCount: data.reviewCount ?? 0,
                createdAt,
                approvedAt: data.approvedAt?.toDate?.() ? data.approvedAt.toDate().toISOString() : undefined,
                imageId: data.imageId || `provider${(Math.floor(Math.random() * 12) + 1)}`,
            } as Provider;
        });

        // Sort: Featured first, then by rating
        return providers.sort((a, b) => {
            if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
            return b.rating - a.rating;
        });
    } catch (e) {
        console.error("Error in getProviders:", e);
        return [];
    }
}

/**
 * Fetches a single provider by ID.
 */
export async function getProviderById(id: string): Promise<Provider | undefined> {
    const db = adminDb;
    if (!db || typeof db.collection !== 'function') return undefined;

    try {
        const providerRef = db.collection('providers').doc(id);
        const providerDoc = await providerRef.get();
        if (!providerDoc.exists) return undefined;
        
        const data = providerDoc.data()!;
        
        // Fetch service name
        let categoryName = 'Artisan';
        if (data.serviceId) {
            const serviceDoc = await db.collection('services').doc(data.serviceId).get();
            if (serviceDoc.exists) {
                categoryName = serviceDoc.data()!.name;
            } else {
                const staticCat = CATEGORIES.find(c => c.id === data.serviceId || c.slug === data.serviceId);
                categoryName = staticCat?.name || data.serviceId;
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
            createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            approvedAt: data.approvedAt?.toDate?.() ? data.approvedAt.toDate().toISOString() : undefined,
            imageId: data.imageId,
        } as Provider;
    } catch (e) {
        console.error("Error in getProviderById:", e);
        return undefined;
    }
}
