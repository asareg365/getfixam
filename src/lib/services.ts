// IMPORTANT: This file uses mock data for demonstration.
// To use Firebase, you'll need to replace the logic in each function
// with actual Firebase queries, as shown in the comments.

import { collection, getDocs, query, where, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { CATEGORIES, PROVIDERS, REVIEWS } from './data';
import type { Category, Provider, Review } from './types';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Fetches all categories.
 */
export async function getCategories(): Promise<Category[]> {
  await delay(100);
  return CATEGORIES;
  /*
  // FIREBASE IMPLEMENTATION:
  const q = query(collection(db, "categories"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  */
}

/**
 * Fetches a category by its slug.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  await delay(100);
  if (slug === 'all') {
    return { id: 'all', name: 'All Artisans', slug: 'all', icon: () => null };
  }
  return CATEGORIES.find(c => c.slug === slug);
  /*
  // FIREBASE IMPLEMENTATION:
  const q = query(collection(db, "categories"), where("slug", "==", slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return undefined;
  }
  const docData = snapshot.docs[0];
  return { id: docData.id, ...docData.data() } as Category;
  */
}


/**
 * Fetches all providers, optionally filtering by category.
 */
export async function getProviders(categorySlug?: string): Promise<Provider[]> {
  await delay(200);
  // Only show approved providers on the public site
  const approvedProviders = PROVIDERS.filter(p => p.status === 'approved');

  if (!categorySlug || categorySlug === 'all') {
    return approvedProviders;
  }
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return [];

  // This logic is based on the proposal: always filter for Berekum.
  return approvedProviders.filter(p => p.category === category.name && p.location.city === 'Berekum');
  /*
  // FIREBASE IMPLEMENTATION:
  let q;
  const providersRef = collection(db, "providers");
  const constraints = [where("status", "==", "approved"), where("location.city", "==", "Berekum")];

  if (categorySlug && categorySlug !== 'all') {
    const category = await getCategoryBySlug(categorySlug);
    if (!category) return [];
    constraints.push(where("category", "==", category.name));
  }
  
  q = query(providersRef, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider));
  */
}


/**
 * Fetches a single provider by its ID.
 */
export async function getProviderById(id: string): Promise<Provider | undefined> {
  await delay(150);
  // Only return provider if they are approved for public viewing
  const provider = PROVIDERS.find(p => p.id === id);
  return provider?.status === 'approved' ? provider : undefined;
  /*
  // FIREBASE IMPLEMENTATION:
  const docRef = doc(db, "providers", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const provider = { id: docSnap.id, ...docSnap.data() } as Provider;
    // Only return provider if they are approved
    return provider.status === 'approved' ? provider : undefined;
  }
  return undefined;
  */
}

/**
 * Fetches all reviews for a specific provider.
 */
export async function getReviewsByProviderId(providerId: string): Promise<Review[]> {
  await delay(250);
  return REVIEWS.filter(r => r.providerId === providerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  /*
  // FIREBASE IMPLEMENTATION:
  const q = query(collection(db, "reviews"), where("providerId", "==", providerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)).sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  */
}

/**
 * Adds a new provider to the database.
 * NOTE: In a real app, this would be a protected admin-only function.
 */
export async function addProvider(data: Omit<Provider, 'id' | 'rating' | 'reviewCount' | 'createdAt' | 'serviceId'>) {
    console.log("Adding provider:", data);
    const category = CATEGORIES.find(c => c.name === data.category);

    const newProvider: Provider = {
        id: (PROVIDERS.length + 1).toString(),
        ...data,
        serviceId: category?.id || '',
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
    };

    PROVIDERS.unshift(newProvider); // Add to the beginning of the array for visibility
    /*
    // FIREBASE IMPLEMENTATION:
     const category = CATEGORIES.find(c => c.name === data.category);
     await addDoc(collection(db, 'providers'), {
      ...data,
      serviceId: category?.id || '',
      rating: 0,
      reviewCount: 0,
      createdAt: serverTimestamp()
    });
    */
    return { success: true, message: "Provider added successfully!" };
}

/**
 * Adds a new review for a provider.
 * NOTE: In a real app, you might want to update the provider's average rating here too.
 */
export async function addReview(data: Omit<Review, 'id' | 'createdAt'>) {
    console.log("Adding review:", data);
    // This is where you would add the document to Firestore
    /*
    // FIREBASE IMPLEMENTATION:
    await addDoc(collection(db, 'reviews'), {
      ...data,
      createdAt: serverTimestamp()
    });
    // You would also need a transaction or a cloud function to update the provider's rating and reviewCount.
    */
    return { success: true, message: "Thank you for your review!" };
}
