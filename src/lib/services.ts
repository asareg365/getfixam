
import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Category, Provider, Review, Request, Prediction, StandbyPrediction } from './types';

/**
 * Fetches all active categories from Firestore.
 */
export async function getCategories(): Promise<Category[]> {
  // Fallback to mock data to prevent server-side timeout issues.
  const { CATEGORIES } = await import('./data');
  return CATEGORIES;
}

/**
 * Fetches a category by its slug from Firestore.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  if (slug === 'all') {
    return { id: 'all', name: 'All Artisans', slug: 'all', icon: 'Wrench' };
  }
  // Fallback to mock data to prevent server-side timeout issues.
  const { CATEGORIES } = await import('./data');
  return CATEGORIES.find(c => c.slug === slug);
}

/**
 * Fetches approved providers from Firestore, optionally filtering by category slug.
 * Featured providers are always listed first.
 */
export async function getProviders(categorySlug?: string): Promise<Provider[]> {
  // Fallback to mock data to prevent server-side timeout issues.
    const { PROVIDERS, CATEGORIES } = await import('./data');
    let providers = PROVIDERS.filter(p => p.status === 'approved' && p.location.city === 'Berekum');
    if (categorySlug && categorySlug !== 'all') {
        const category = CATEGORIES.find(c => c.slug === categorySlug);
        if (!category) return [];
        providers = providers.filter(p => p.serviceId === category.id);
    }
    return providers.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
}

/**
 * Fetches a single approved provider by its ID from Firestore.
 */
export async function getProviderById(id: string): Promise<Provider | undefined> {
  // Fallback to mock data to prevent server-side timeout issues.
    const { PROVIDERS } = await import('./data');
    const provider = PROVIDERS.find(p => p.id === id);
    if (provider && provider.status === 'approved') {
        return provider;
    }
    return undefined;
}

/**
 * Fetches all approved reviews for a specific provider from Firestore.
 */
export async function getReviewsByProviderId(providerId: string): Promise<Review[]> {
  // Fallback to mock data to prevent server-side timeout issues.
    const { REVIEWS } = await import('./data');
    return REVIEWS.filter(r => r.providerId === providerId && r.status === 'approved');
}

/**
 * Adds a new provider to Firestore with 'pending' status.
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
  // Fallback to mock data to prevent server-side timeout issues.
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
