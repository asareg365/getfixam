import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Category, Provider, Review, Request } from './types';

/**
 * Fetches all active categories from Firestore.
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const servicesRef = adminDb.collection("services");
    const q = servicesRef.where("active", "==", true);
    const snapshot = await q.get();
    
    if (snapshot.empty) return [];

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        icon: data.icon,
      } as Category;
    });
  } catch (error) {
    console.warn("Could not fetch categories from Firestore. Falling back to mock data.");
    const { CATEGORIES } = await import('./data');
    return CATEGORIES;
  }
}

/**
 * Fetches a category by its slug from Firestore.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  if (slug === 'all') {
    return { id: 'all', name: 'All Artisans', slug: 'all', icon: 'Wrench' };
  }
  try {
    const servicesRef = adminDb.collection("services");
    const q = servicesRef.where("slug", "==", slug).limit(1);
    const snapshot = await q.get();
    
    if (snapshot.empty) {
      return undefined;
    }
    
    const docData = snapshot.docs[0];
    const data = docData.data();
    return { 
        id: docData.id, 
        name: data.name,
        slug: data.slug,
        icon: data.icon,
    } as Category;
  } catch (error) {
    console.warn(`Could not fetch category with slug "${slug}" from Firestore. Falling back to mock data.`);
    const { CATEGORIES } = await import('./data');
    return CATEGORIES.find(c => c.slug === slug);
  }
}

/**
 * Fetches approved providers from Firestore, optionally filtering by category slug.
 * Featured providers are always listed first.
 */
export async function getProviders(categorySlug?: string): Promise<Provider[]> {
  try {
    let providersQuery = adminDb.collection("providers")
        .where("status", "==", "approved")
        .where("location.city", "==", "Berekum");

    if (categorySlug && categorySlug !== 'all') {
      const category = await getCategoryBySlug(categorySlug);
      if (!category) return [];
      providersQuery = providersQuery.where("serviceId", "==", category.id);
    }
    
    const snapshot = await providersQuery.orderBy('isFeatured', 'desc').orderBy('createdAt', 'desc').get();
    const categories = await getCategories();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const category = categories.find(c => c.id === data.serviceId);
      const providerData: Provider = {
        id: doc.id,
        name: data.name,
        category: category?.name || 'N/A',
        serviceId: data.serviceId,
        phone: data.phone,
        whatsapp: data.whatsapp,
        location: data.location,
        status: data.status,
        verified: data.verified,
        isFeatured: data.isFeatured || false,
        rating: data.rating,
        reviewCount: data.reviewCount,
        imageId: data.imageId,
        createdAt: data.createdAt.toDate().toISOString(),
      };
      if (data.approvedAt) {
          providerData.approvedAt = data.approvedAt.toDate().toISOString();
      }
      if (data.featuredUntil) {
        providerData.featuredUntil = data.featuredUntil.toDate().toISOString();
      }
      return providerData;
    });
  } catch (error) {
    console.warn(`Could not fetch providers from Firestore. Falling back to mock data.`);
    const { PROVIDERS, CATEGORIES } = await import('./data');
    let providers = PROVIDERS.filter(p => p.status === 'approved' && p.location.city === 'Berekum');
    if (categorySlug && categorySlug !== 'all') {
        const category = CATEGORIES.find(c => c.slug === categorySlug);
        if (!category) return [];
        providers = providers.filter(p => p.serviceId === category.id);
    }
    return providers.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }
}

/**
 * Fetches a single approved provider by its ID from Firestore.
 */
export async function getProviderById(id: string): Promise<Provider | undefined> {
  try {
    const docRef = adminDb.collection("providers").doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      if (!data || data.status !== 'approved') {
          return undefined;
      }
      
      let categoryName = 'N/A';
      if (data.serviceId) {
          const serviceDocRef = adminDb.collection("services").doc(data.serviceId);
          const serviceDocSnap = await serviceDocRef.get();
          if (serviceDocSnap.exists) {
              categoryName = serviceDocSnap.data()?.name;
          }
      }
      const providerData: Provider = {
        id: docSnap.id,
        name: data.name,
        category: categoryName,
        serviceId: data.serviceId,
        phone: data.phone,
        whatsapp: data.whatsapp,
        location: data.location,
        status: data.status,
        verified: data.verified,
        isFeatured: data.isFeatured || false,
        rating: data.rating,
        reviewCount: data.reviewCount,
        imageId: data.imageId,
        createdAt: data.createdAt.toDate().toISOString(),
      };
      if (data.approvedAt) {
          providerData.approvedAt = data.approvedAt.toDate().toISOString();
      }
      if (data.featuredUntil) {
        providerData.featuredUntil = data.featuredUntil.toDate().toISOString();
      }
      return providerData;
    }
    return undefined;
  } catch (error) {
    console.warn(`Could not fetch provider with ID "${id}" from Firestore. Falling back to mock data.`);
    const { PROVIDERS } = await import('./data');
    const provider = PROVIDERS.find(p => p.id === id);
    if (provider && provider.status === 'approved') {
        return provider;
    }
    return undefined;
  }
}

/**
 * Fetches all approved reviews for a specific provider from Firestore.
 */
export async function getReviewsByProviderId(providerId: string): Promise<Review[]> {
  try {
    const reviewsRef = adminDb.collection("reviews");
    const q = reviewsRef
        .where("providerId", "==", providerId)
        .where("status", "==", "approved")
        .orderBy("createdAt", "desc");
    const snapshot = await q.get();

    if (snapshot.empty) return [];

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        providerId: data.providerId,
        userName: data.userName,
        rating: data.rating,
        comment: data.comment,
        userImageId: data.userImageId,
        status: data.status,
        createdAt: data.createdAt.toDate().toISOString(),
      } as Review;
    });
  } catch (error) {
    console.warn(`Could not fetch reviews for provider "${providerId}" from Firestore. Falling back to mock data.`);
    const { REVIEWS } = await import('./data');
    return REVIEWS.filter(r => r.providerId === providerId && r.status === 'approved');
  }
}

/**
 * Adds a new provider to Firestore with 'pending' status.
 */
export async function addProvider(
    data: { name: string; category: string; phone: string; whatsapp: string; location: object; imageId: string; }
) {
    const servicesRef = adminDb.collection("services");
    const q = servicesRef.where("name", "==", data.category);
    const serviceSnapshot = await q.get();

    let serviceId = '';
    if (!serviceSnapshot.empty) {
        serviceId = serviceSnapshot.docs[0].id;
    }

    await adminDb.collection('providers').add({
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      location: data.location,
      serviceId: serviceId,
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
 * Adds a new review to Firestore with 'pending' status for moderation.
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
 * Fetches the list of zones for Berekum from Firestore.
 */
export async function getBerekumZones(): Promise<string[]> {
  try {
    const docRef = adminDb.collection("locations").doc("berekum");
    const docSnap = await docRef.get();

    if (docSnap.exists && docSnap.data()?.zones) {
      return docSnap.data()?.zones as string[];
    }
  } catch (error) {
     console.warn(`Could not fetch zones from Firestore. Falling back to mock data.`);
  }
  
  // Fallback to mock data if Firestore fails or document doesn't exist
  const { BEREKUM_ZONES } = await import('./data');
  return BEREKUM_ZONES;
}

/**
 * Fetches all data needed for the admin dashboard.
 * It prioritizes fetching pre-computed daily stats for efficiency.
 * If daily stats are not available, it falls back to direct queries.
 */
export async function getDashboardData() {
    try {
        // Fetch provider and service stats directly as they are not part of daily stats
        const [providersSnap, servicesSnap] = await Promise.all([
            adminDb.collection('providers').get(),
            adminDb.collection('services').where('active', '==', true).get(),
        ]);

        const totalProviders = providersSnap.size;
        const pendingProviders = providersSnap.docs.filter(doc => doc.data().status === 'pending').length;
        const activeServices = servicesSnap.size;

        // Variables for stats
        let totalRequests = 0;
        let whatsappMessages = 0;
        let failedMessages = 0;
        let serviceChartData: { name: string; total: number }[] = [];
        let locationChartData: { name: string; total: number }[] = [];

        // Attempt to fetch pre-computed daily stats
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        const todayStatsRef = adminDb.collection("daily_stats").doc(today);
        let statsSnap = await todayStatsRef.get();

        if (!statsSnap.exists()) {
            const yesterdayStatsRef = adminDb.collection("daily_stats").doc(yesterday);
            statsSnap = await yesterdayStatsRef.get();
        }

        if (statsSnap.exists()) {
            const data = statsSnap.data()!;
            totalRequests = data.totalRequests || 0;
            whatsappMessages = data.whatsappMessages || 0;
            failedMessages = data.failedMessages || 0;
            
            serviceChartData = Object.entries(data.services || {}).map(([name, total]) => ({ name, total: total as number }));
            locationChartData = Object.entries(data.locations || {}).map(([name, total]) => ({ name, total: total as number }));

        } else {
            // Fallback to direct queries if no daily stats are found
            console.warn(`Daily stats for ${today} or ${yesterday} not found. Falling back to direct queries.`);
            
            const [requestsSnap, logsSnap] = await Promise.all([
                adminDb.collection('requests').get(),
                adminDb.collection('bot_logs').get(), // Assuming bot_logs collection exists
            ]);

            totalRequests = requestsSnap.size;
            const requests = requestsSnap.docs.map(doc => doc.data() as Omit<Request, 'id' | 'createdAt'>);
            const serviceCounts = requests.reduce((acc, req) => {
                acc[req.serviceType] = (acc[req.serviceType] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            const locationCounts = requests.reduce((acc, req) => {
                acc[req.location] = (acc[req.location] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            serviceChartData = Object.entries(serviceCounts).map(([name, total]) => ({ name, total }));
            locationChartData = Object.entries(locationCounts).map(([name, total]) => ({ name, total }));

            // Stats from bot_logs
            whatsappMessages = logsSnap.size;
            failedMessages = logsSnap.docs.filter(doc => doc.data().status === 'failed').length;
        }

        return {
            totalProviders,
            pendingProviders,
            activeServices,
            totalRequests,
            whatsappMessages,
            failedMessages,
            serviceChartData,
            locationChartData,
        };

    } catch (error) {
        console.warn('Could not fetch dashboard data from Firestore. Falling back to mock data.', error);
        // Fallback to mock data from the original function
        const { PROVIDERS, CATEGORIES, REQUESTS } = await import('./data');
        
        const serviceCounts = REQUESTS.reduce((acc, req) => {
            acc[req.serviceType] = (acc[req.serviceType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const locationCounts = REQUESTS.reduce((acc, req) => {
            acc[req.location] = (acc[req.location] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalProviders: PROVIDERS.length,
            pendingProviders: PROVIDERS.filter(p => p.status === 'pending').length,
            activeServices: CATEGORIES.length,
            totalRequests: REQUESTS.length,
            whatsappMessages: 0, // No mock data for this
            failedMessages: 0, // No mock data for this
            serviceChartData: Object.entries(serviceCounts).map(([name, total]) => ({ name, total })),
            locationChartData: Object.entries(locationCounts).map(([name, total]) => ({ name, total })),
        };
    }
}
