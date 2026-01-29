
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Category, Provider, Review, Request, Prediction, StandbyPrediction } from './types';

/**
 * Fetches all active categories from Firestore using the client SDK.
 */
export async function getCategories(): Promise<Category[]> {
    const servicesRef = collection(db, 'services');
    // Fetch active services and sort them in the application code to avoid requiring a composite index.
    const q = query(servicesRef, where('active', '==', true));
    const servicesSnap = await getDocs(q);

    if (servicesSnap.empty) {
      return [];
    }

    const categories = servicesSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        icon: data.icon,
      };
    });
    
    // Sort by name alphabetically
    return categories.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Fetches a category by its slug from Firestore using the client SDK.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  if (slug === 'all') {
    return { id: 'all', name: 'All Artisans', slug: 'all', icon: 'Wrench' };
  }
  
  const servicesRef = collection(db, 'services');
  const q = query(servicesRef, where('slug', '==', slug), limit(1));
  const servicesSnap = await getDocs(q);
  
  if (servicesSnap.empty) {
    return undefined;
  }
  
  const doc = servicesSnap.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    slug: data.slug,
    icon: data.icon,
  };
}

/**
 * Fetches approved providers from Firestore, optionally filtering by category slug, using the client SDK.
 * Featured providers are always listed first.
 */
export async function getProviders(categorySlug?: string): Promise<Provider[]> {
    try {
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
        let q;
        if (serviceIdForSlug) {
            q = query(providersRef, where('status', '==', 'approved'), where('serviceId', '==', serviceIdForSlug));
        } else {
            q = query(providersRef, where('status', '==', 'approved'));
        }
        
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
                location: data.location,
                status: data.status,
                verified: data.verified,
                isFeatured: data.isFeatured ?? false,
                rating: data.rating ?? 0,
                reviewCount: data.reviewCount ?? 0,
                createdAt: data.createdAt?.toDate().toISOString() || new Date(0).toISOString(),
                approvedAt: data.approvedAt?.toDate().toISOString(),
                featuredUntil: data.featuredUntil?.toDate().toISOString(),
                imageId: data.imageId,
            } as Provider;
        }).filter(p => p.location?.city === 'Berekum');

        return providers.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    } catch (error) {
        console.error("Error fetching providers: ", error);
        return [];
    }
}

/**
 * Fetches a single approved provider by its ID from Firestore using the client SDK.
 */
export async function getProviderById(id: string): Promise<Provider | undefined> {
    try {
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
            location: data.location,
            status: data.status,
            verified: data.verified,
            isFeatured: data.isFeatured ?? false,
            rating: data.rating ?? 0,
            reviewCount: data.reviewCount ?? 0,
            createdAt: data.createdAt?.toDate().toISOString() || new Date(0).toISOString(),
            approvedAt: data.approvedAt?.toDate().toISOString(),
            featuredUntil: data.featuredUntil?.toDate().toISOString(),
            imageId: data.imageId,
        } as Provider;
    } catch (error) {
        console.error(`Error fetching provider by ID ${id}: `, error);
        return undefined;
    }
}

/**
 * Fetches all approved reviews for a specific provider from Firestore using the client SDK.
 */
export async function getReviewsByProviderId(providerId: string): Promise<Review[]> {
    try {
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
                createdAt: data.createdAt?.toDate().toISOString() || new Date(0).toISOString(),
                userImageId: data.userImageId,
                status: data.status,
            } as Review;
        });
    } catch (error) {
        console.error(`Error fetching reviews for provider ${providerId}: `, error);
        return [];
    }
}

/**
 * Adds a new provider to Firestore with 'pending' status. Uses Admin SDK.
 */
export async function addProvider(
    data: { name: string; serviceId: string; phone: string; whatsapp: string; location: object; imageId: string; }
) {
    await adminDb.collection('providers').add({
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      location: data.location,
      serviceId: data.serviceId,
      imageId: data.imageId,
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
    try {
        const locationDoc = await getDoc(doc(db, 'locations', 'berekum'));
        if (locationDoc.exists()) {
            return locationDoc.data()?.zones || [];
        }
    } catch (error) {
        console.warn('Could not fetch zones from Firestore, falling back to mock data.', error);
    }
    
    const { BEREKUM_ZONES } = await import('./data');
    return BEREKUM_ZONES;
}

/**
 * Fetches all data needed for the admin dashboard.
 * This implementation uses mock data to ensure the dashboard is fast and responsive.
 */
export async function getDashboardData() {
    try {
        const { PROVIDERS, CATEGORIES, REQUESTS } = await import('./data');
        
        const totalProviders = PROVIDERS.length;
        const pendingProviders = PROVIDERS.filter(p => p.status === 'pending').length;
        const activeServices = CATEGORIES.length;
        const totalRequests = REQUESTS.length;
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

        const prediction: Prediction | null = {
            topService: ['Electrician', 12],
            topArea: ['Kato', 8],
            confidence: 'High',
            basedOnDays: 7,
            generatedAt: new Date().toISOString(),
        };
        
        const standbyArtisans = PROVIDERS.filter(p => p.category === 'Electrician' && p.status === 'approved').slice(0, 2);
        const standby: StandbyPrediction | null = standbyArtisans.length > 0 ? {
            serviceType: 'Electrician',
            area: 'Kato',
            artisans: standbyArtisans,
            generatedAt: new Date().toISOString(),
        } : null;

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
        console.error('CRITICAL: Could not generate mock dashboard data.', error);
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
