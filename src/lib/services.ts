import { adminDb } from './firebase-admin';
import { db as clientDb } from './firebase';
import { collection, query, where, getDocs as clientGetDocs, orderBy } from 'firebase/firestore';
import type { Category, Provider } from './types';
import { getCategories } from './data';
import { CATEGORIES } from './constants';

/**
 * Helper to pick a relevant image based on the category name.
 */
function getImageForProvider(id: string, categoryName: string, existingImageId?: string): string {
    // If they already have a custom image ID that isn't one of our auto-placeholders, keep it
    if (existingImageId && !existingImageId.startsWith('provider')) return existingImageId;
    
    const cat = categoryName.toLowerCase();
    
    const getImageFromPool = (pool: string[]) => {
        const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % pool.length;
        return pool[index];
    };

    if (cat.includes('electric')) return getImageFromPool(['provider1', 'provider7']);
    if (cat.includes('plumb')) return getImageFromPool(['provider2', 'provider8']);
    if (cat.includes('phone') || cat.includes('mobile') || cat.includes('repair')) {
        if (cat.includes('phone') || cat.includes('mobile')) return getImageFromPool(['provider3', 'provider9']);
    }
    if (cat.includes('mechanic') || cat.includes('car') || cat.includes('auto')) return getImageFromPool(['provider4', 'provider10']);
    if (cat.includes('hair') || cat.includes('beauty') || cat.includes('salon') || cat.includes('beautician')) return getImageFromPool(['provider5', 'provider12']);
    if (cat.includes('carpenter') || cat.includes('wood') || cat.includes('furniture')) return getImageFromPool(['provider6', 'provider11']);
    
    // Default to a random provider image if no match
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
 * Fetches providers from Firestore. 
 * Uses a Dual-Fetch strategy: Admin SDK first, fallback to Client SDK for maximum reliability.
 */
export async function getProviders(categorySlug?: string): Promise<Provider[]> {
    try {
        // 1. Determine target service ID if a slug is provided
        let targetServiceId: string | null = null;
        let servicesMap = new Map<string, string>();

        if (adminDb) {
            const servicesSnap = await adminDb.collection('services').get();
            servicesSnap.forEach((doc: any) => {
                const data = doc.data();
                servicesMap.set(doc.id, data.name);
                if (categorySlug && data.slug === categorySlug) {
                    targetServiceId = doc.id;
                }
            });
        }

        // If not found in dynamic services, check static categories
        if (!targetServiceId && categorySlug && categorySlug !== 'all') {
            const staticCat = CATEGORIES.find(c => c.slug === categorySlug);
            if (staticCat) targetServiceId = staticCat.id;
            else targetServiceId = categorySlug; // Last resort fallback
        }

        let providersData: any[] = [];

        // 2. Try fetching via Admin SDK
        if (adminDb) {
            let providersQuery = adminDb.collection('providers').where('status', 'in', ['approved', 'pending']);
            
            if (categorySlug && categorySlug !== 'all' && targetServiceId) {
                providersQuery = providersQuery.where('serviceId', '==', targetServiceId);
            }

            const snap = await providersQuery.get();
            providersData = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        } 
        
        // 3. Fallback to Client SDK if Admin fetch failed or returned nothing (resilience)
        if (providersData.length === 0) {
            const providersRef = collection(clientDb, 'providers');
            let q = query(providersRef, where('status', 'in', ['approved', 'pending']));
            
            const snap = await clientGetDocs(q);
            providersData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Client-side filtering if slug is provided
            if (categorySlug && categorySlug !== 'all' && targetServiceId) {
                providersData = providersData.filter(p => p.serviceId === targetServiceId);
            }
        }

        // 4. Map to final Provider type and ensure serialization
        const providers = providersData.map(data => {
            const categoryName = servicesMap.get(data.serviceId) ||
                                 CATEGORIES.find(c => c.id === data.serviceId || c.slug === data.serviceId)?.name ||
                                 data.category ||
                                 'Artisan';

            return {
                id: data.id,
                authUid: data.authUid || '',
                name: data.name || 'Unknown',
                category: categoryName,
                serviceId: data.serviceId || '',
                phone: data.phone || '',
                whatsapp: data.whatsapp || '',
                digitalAddress: data.digitalAddress || '',
                location: data.location || { region: 'Bono Region', city: 'Berekum', zone: 'Unknown' },
                status: data.status || 'pending',
                verified: !!data.verified,
                isFeatured: !!data.isFeatured,
                rating: data.rating || 0,
                reviewCount: data.reviewCount || 0,
                imageId: getImageForProvider(data.id, categoryName, data.imageId),
                createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : (typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString()),
                approvedAt: data.approvedAt?.toDate?.() ? data.approvedAt.toDate().toISOString() : (typeof data.approvedAt === 'string' ? data.approvedAt : undefined),
                updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : (typeof data.updatedAt === 'string' ? data.updatedAt : undefined),
            } as Provider;
        });

        // 5. Sort: Featured first, then by rating
        return providers.sort((a, b) => {
            if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
            return b.rating - a.rating;
        });

    } catch (e) {
        console.error("Critical error in getProviders:", e);
        return [];
    }
}

/**
 * Fetches a single provider by ID.
 */
export async function getProviderById(id: string): Promise<Provider | undefined> {
    try {
        let data: any = null;
        let providerId: string = id;

        if (adminDb) {
            const doc = await adminDb.collection('providers').doc(id).get();
            if (doc.exists) data = doc.data();
        }

        if (!data) {
            return undefined;
        }
        
        let categoryName = 'Artisan';
        if (data.serviceId && adminDb) {
            const serviceDoc = await adminDb.collection('services').doc(data.serviceId).get();
            const serviceName = serviceDoc.exists ? serviceDoc.data()!.name : undefined;
            const staticCatName = CATEGORIES.find(c => c.id === data.serviceId || c.slug === data.serviceId)?.name;
            categoryName = serviceName || staticCatName || data.serviceId;
        }

        return {
            id: providerId,
            authUid: data.authUid || '',
            name: data.name || 'Unknown',
            category: categoryName,
            serviceId: data.serviceId || '',
            phone: data.phone || '',
            whatsapp: data.whatsapp || '',
            digitalAddress: data.digitalAddress || '',
            location: data.location || { region: 'Bono Region', city: 'Berekum', zone: 'Unknown' },
            status: data.status || 'pending',
            verified: !!data.verified,
            isFeatured: !!data.isFeatured,
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
            imageId: getImageForProvider(providerId, categoryName, data.imageId),
            createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : (typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString()),
            approvedAt: data.approvedAt?.toDate?.() ? data.approvedAt.toDate().toISOString() : (typeof data.approvedAt === 'string' ? data.approvedAt : undefined),
            updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : (typeof data.updatedAt === 'string' ? data.updatedAt : undefined),
        } as Provider;
    } catch (e) {
        console.error("Error in getProviderById:", e);
        return undefined;
    }
}
