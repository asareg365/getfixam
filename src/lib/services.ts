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
  if (!categorySlug || categorySlug === 'all') {
    return PROVIDERS;
  }
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return [];

  // This logic is based on the proposal: always filter for Berekum.
  return PROVIDERS.filter(p => p.category === category.name && p.area.toLowerCase().includes('berekum'));
  /*
  // FIREBASE IMPLEMENTATION:
  let q;
  if (categorySlug && categorySlug !== 'all') {
    const category = await getCategoryBySlug(categorySlug);
    if (!category) return [];
    q = query(
      collection(db, "providers"),
      where("category", "==", category.name),
      where("area", "==", "Berekum") // As per proposal
    );
  } else {
    q = query(
        collection(db, "providers"),
        where("area", "==", "Berekum")
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider));
  */
}


/**
 * Fetches a single provider by its ID.
 */
export async function getProviderById(id: string): Promise<Provider | undefined> {
  await delay(150);
  return PROVIDERS.find(p => p.id === id);
  /*
  // FIREBASE IMPLEMENTATION:
  const docRef = doc(db, "providers", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Provider;
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
export async function addProvider(data: Omit<Provider, 'id' | 'rating' | 'reviewCount' | 'createdAt'>) {
    console.log("Adding provider:", data);
    // This is where you would add the document to Firestore
    /*
    // FIREBASE IMPLEMENTATION:
     await addDoc(collection(db, 'providers'), {
      ...data,
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
