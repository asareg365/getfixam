import { adminDb } from './firebase-admin';
import type { Category, Provider, Review } from './types';
import { getCategories } from './data';

/**
 * Fetches a category by its slug from the cached list of categories.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  if (slug === 'all') {
    return { id: 'all', name: 'All Artisans', slug: 'all', icon: 'Wrench' };
  }
  
  const categories = await getCategories();
  return categories.find(category => category.slug === slug);
}

/**
 * Fetches approved providers from Firestore, optionally filtering by category slug.
 * Featured providers are listed first.
 */
export async function getProviders(categorySlug?: string): Promise<Provider[]> {
    const db = adminDb;
    if (!db || typeof db.collection !== 'function') {
        return [];
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
                imageId: data.imageId,
            } as Provider;
        });

        return providers.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    } catch (e) {
        console.error("Error in getProviders:", e);
        return [];
    }
}

/**
 * Fetches a single approved provider by its ID.
 */
export async function getProviderById(id: string): Promise<Provider | undefined> {
    const db = adminDb;
    if (!db || typeof db.collection !== 'function') {
        return undefined;
    }

    try {
        const providerRef = db.collection('providers').doc(id);
        const providerDoc = await providerRef.get();
        if (!providerDoc.exists) {
            return undefined;
        }
        const data = providerDoc.data()!;

        if (data.status !== 'approved') {
            return undefined;
        }

        let categoryName = 'N/A';
        if (data.serviceId) {
            const serviceDoc = await db.collection('services').doc(data.serviceId).get();
            if (serviceDoc.exists) {
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
            imageId: data.imageId,
        } as Provider;
    } catch (e) {
        console.error("Error in getProviderById:", e);
        return undefined;
    }
}