import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Category, Provider, Review } from './types';

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
    return { id: 'all', name: 'All Artisans', slug: 'all', icon: '' };
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
