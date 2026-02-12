import { adminDb } from './firebase-admin';
import { db as clientDb } from './firebase';
import { collection, query, where, getDocs as clientGetDocs, orderBy } from 'firebase/firestore';
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
            let categoryName = servicesMap.get(data.serviceId);
            if (!categoryName) {
                const staticCat = CATEGORIES.find(c => c.id === data.serviceId || c.slug === data.serviceId);
                categoryName = staticCat?.name || data.category || 'Artisan';
            }

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
                imageId: data.imageId || `provider${(Math.floor(Math.random() * 12) + 1)}`,
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
            if (serviceDoc.exists) {
                categoryName = serviceDoc.data()!.name;
            } else {
                const staticCat = CATEGORIES.find(c => c.id === data.serviceId || c.slug === data.serviceId);
                categoryName = staticCat?.name || data.serviceId;
            }
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
            imageId: data.imageId || `provider${(Math.floor(Math.random() * 12) + 1)}`,
            createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : (typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString()),
            approvedAt: data.approvedAt?.toDate?.() ? data.approvedAt.toDate().toISOString() : (typeof data.approvedAt === 'string' ? data.approvedAt : undefined),
            updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : (typeof data.updatedAt === 'string' ? data.updatedAt : undefined),
        } as Provider;
    } catch (e) {
        console.error("Error in getProviderById:", e);
        return undefined;
    }
}
