
import { adminDb } from './firebase-admin';
import type { Category, Provider } from './types';
import { getCategories } from './data';
import { CATEGORIES, getCityConfig } from './constants';

/**
 * Helper to pick a relevant image based on the category name.
 */
function getImageForProvider(id: string, categoryName: string, existingImageId?: string): string {
    if (existingImageId && !existingImageId.startsWith('provider')) return existingImageId;
    
    const cat = categoryName.toLowerCase();
    
    const getImageFromPool = (pool: string[]) => {
        const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % pool.length;
        return pool[index];
    };

    if (cat.includes('electric')) return getImageFromPool(['provider1', 'provider7']);
    if (cat.includes('plumb')) return getImageFromPool(['provider2', 'provider8']);
    if (cat.includes('phone') || cat.includes('mobile') || cat.includes('repair')) {
        return getImageFromPool(['provider3', 'provider9']);
    }
    if (cat.includes('mechanic') || cat.includes('car') || cat.includes('auto')) return getImageFromPool(['provider4', 'provider10']);
    if (cat.includes('hair') || cat.includes('beauty') || cat.includes('salon') || cat.includes('beautician')) return getImageFromPool(['provider5', 'provider12']);
    if (cat.includes('carpenter') || cat.includes('wood') || cat.includes('furniture')) return getImageFromPool(['provider6', 'provider11']);
    
    const randomIndex = (id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 12) + 1;
    return `provider${randomIndex}`;
}

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
 * Fetches providers from Firestore using the Admin SDK.
 * Handles city and category filtering robustly.
 * CRITICAL: Only returns providers with an active subscription to clients.
 */
export async function getProviders(cityId?: string, categorySlug?: string): Promise<Provider[]> {
    if (!adminDb) {
        return [];
    }

    try {
        const cityConfig = getCityConfig(cityId);
        const categories = await getCategories();
        let targetServiceId: string | null = null;
        const servicesMap = new Map<string, string>();

        categories.forEach(cat => {
            servicesMap.set(cat.id, cat.name);
            if (categorySlug && cat.slug === categorySlug) {
                targetServiceId = cat.id;
            }
        });

        // Base filter: only show approved and SUBSCRIPTION ACTIVE providers to clients
        let providersQuery = adminDb.collection('providers')
            .where('status', '==', 'approved')
            .where('subscriptionActive', '==', true);
        
        // Filter by city name (e.g. 'Accra' or 'Berekum')
        if (cityConfig) {
            providersQuery = providersQuery.where('location.city', '==', cityConfig.name);
        }

        // Filter by specific category
        if (categorySlug && categorySlug !== 'all' && targetServiceId) {
            providersQuery = providersQuery.where('serviceId', '==', targetServiceId);
        }

        const snap = await providersQuery.get();
        
        const providers = snap.docs.map((doc: any) => {
            const data = doc.data();
            let categoryName = servicesMap.get(data.serviceId) || data.category || 'Artisan';

            return {
                id: doc.id,
                authUid: data.authUid || '',
                name: data.name || 'Unknown',
                category: categoryName,
                serviceId: data.serviceId || '',
                phone: data.phone || '',
                whatsapp: data.whatsapp || '',
                digitalAddress: data.digitalAddress || '',
                location: data.location || { region: cityConfig.region, city: cityConfig.name, zone: 'Unknown' },
                status: data.status || 'pending',
                verified: !!data.verified,
                subscriptionActive: !!data.subscriptionActive,
                isFeatured: !!data.isFeatured,
                rating: data.rating || 0,
                reviewCount: data.reviewCount || 0,
                imageId: getImageForProvider(doc.id, categoryName, data.imageId),
                createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : (typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString()),
                approvedAt: data.approvedAt?.toDate?.() ? data.approvedAt.toDate().toISOString() : undefined,
                updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : undefined,
                services: data.services || []
            } as Provider;
        });

        return providers.sort((a: Provider, b: Provider) => {
            if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
            return b.rating - a.rating;
        });

    } catch (e: any) {
        console.warn("[Services] Could not fetch providers. Reason:", e.message);
        return [];
    }
}

/**
 * Fetches a single provider by ID.
 * CRITICAL: Returns undefined if the provider does not have an active subscription (unless used by admin).
 */
export async function getProviderById(id: string): Promise<Provider | undefined> {
    if (!adminDb) return undefined;

    try {
        const doc = await adminDb.collection('providers').doc(id).get();
        if (!doc.exists) return undefined;
        
        const data = doc.data();
        if (!data) return undefined;

        // Hide from public if subscription is inactive and not an internal admin call
        // Note: For full isolation, security rules should also handle this.
        if (data.status !== 'approved' || data.subscriptionActive !== true) {
            return undefined;
        }

        const categories = await getCategories();
        
        let categoryName = 'Artisan';
        const matchedCat = categories.find(c => c.id === data.serviceId || c.slug === data.serviceId);
        if (matchedCat) {
            categoryName = matchedCat.name;
        } else if (data.category) {
            categoryName = data.category;
        }

        return {
            id: doc.id,
            authUid: data.authUid || '',
            name: data.name || 'Unknown',
            category: categoryName,
            serviceId: data.serviceId || '',
            phone: data.phone || '',
            whatsapp: data.whatsapp || '',
            digitalAddress: data.digitalAddress || '',
            location: data.location || { region: 'Ghana', city: 'Unknown', zone: 'Unknown' },
            status: data.status || 'pending',
            verified: !!data.verified,
            subscriptionActive: !!data.subscriptionActive,
            isFeatured: !!data.isFeatured,
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
            imageId: getImageForProvider(doc.id, categoryName, data.imageId),
            createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : (typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString()),
            approvedAt: data.approvedAt?.toDate?.() ? data.approvedAt.toDate().toISOString() : undefined,
            updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : undefined,
            services: data.services || []
        } as Provider;
    } catch (e: any) {
        console.warn("[Services] Could not fetch provider by ID. Reason:", e.message);
        return undefined;
    }
}
