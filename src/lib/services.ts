import { collection, getDocs, query, where, doc, getDoc, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import type { Category, Provider, Review } from './types';
import { Wrench, Zap, Smartphone, Car, Hammer, Scissors, Sparkles, Shirt, Tv2, type LucideIcon } from 'lucide-react';

// Helper to map icon string from DB to Lucide component
const iconMap: { [key: string]: LucideIcon } = {
  'Wrench': Wrench,
  'Zap': Zap,
  'Smartphone': Smartphone,
  'Car': Car,
  'Hammer': Hammer,
  'Scissors': Scissors,
  'Sparkles': Sparkles,
  'Shirt': Shirt,
  'Tv2': Tv2,
};
const getIcon = (name: string): LucideIcon => iconMap[name] || Wrench;


/**
 * Fetches all active categories from Firestore.
 */
export async function getCategories(): Promise<Category[]> {
  const servicesRef = collection(db, "services");
  const q = query(servicesRef, where("active", "==", true));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      slug: data.slug,
      icon: getIcon(data.icon),
    } as Category;
  });
}

/**
 * Fetches a category by its slug from Firestore.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  if (slug === 'all') {
    return { id: 'all', name: 'All Artisans', slug: 'all', icon: () => null };
  }

  const servicesRef = collection(db, "services");
  const q = query(servicesRef, where("slug", "==", slug));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return undefined;
  }
  
  const docData = snapshot.docs[0];
  const data = docData.data();
  return { 
      id: docData.id, 
      name: data.name,
      slug: data.slug,
      icon: getIcon(data.icon),
  } as Category;
}

/**
 * Fetches approved providers from Firestore, optionally filtering by category slug.
 */
export async function getProviders(categorySlug?: string): Promise<Provider[]> {
  const providersRef = collection(db, "providers");
  
  const constraints = [
      where("status", "==", "approved"), 
      where("location.city", "==", "Berekum")
  ];

  if (categorySlug && categorySlug !== 'all') {
    const category = await getCategoryBySlug(categorySlug);
    if (!category) return [];
    constraints.push(where("serviceId", "==", category.id));
  }
  
  const q = query(providersRef, ...constraints);
  const snapshot = await getDocs(q);
  const categories = await getCategories();
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    const category = categories.find(c => c.id === data.serviceId);
    return {
      id: doc.id,
      ...data,
      category: category?.name || 'N/A',
      createdAt: data.createdAt.toDate().toISOString(),
      approvedAt: data.approvedAt?.toDate().toISOString(),
    } as Provider;
  });
}

/**
 * Fetches a single approved provider by its ID from Firestore.
 */
export async function getProviderById(id: string): Promise<Provider | undefined> {
  const docRef = doc(db, "providers", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.status !== 'approved') {
        return undefined;
    }
    
    let categoryName = 'N/A';
    if (data.serviceId) {
        const serviceDocRef = doc(db, "services", data.serviceId);
        const serviceDocSnap = await getDoc(serviceDocRef);
        if (serviceDocSnap.exists()) {
            categoryName = serviceDocSnap.data().name;
        }
    }

    return { 
        id: docSnap.id, 
        ...data,
        category: categoryName,
        createdAt: data.createdAt.toDate().toISOString(),
        approvedAt: data.approvedAt?.toDate().toISOString(),
    } as Provider;
  }
  return undefined;
}

/**
 * Fetches all approved reviews for a specific provider from Firestore.
 */
export async function getReviewsByProviderId(providerId: string): Promise<Review[]> {
  const reviewsRef = collection(db, "reviews");
  const q = query(reviewsRef, 
      where("providerId", "==", providerId), 
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString(),
  } as Review));
}

/**
 * Adds a new provider to Firestore with 'pending' status.
 */
export async function addProvider(
    data: { name: string; category: string; phone: string; whatsapp: string; location: object; imageId: string; }
) {
    const servicesRef = collection(db, "services");
    const q = query(servicesRef, where("name", "==", data.category));
    const serviceSnapshot = await getDocs(q);

    let serviceId = '';
    if (!serviceSnapshot.empty) {
        serviceId = serviceSnapshot.docs[0].id;
    }

    await addDoc(collection(db, 'providers'), {
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      location: data.location,
      serviceId: serviceId,
      imageId: data.imageId,
      status: "pending",
      verified: false,
      rating: 0,
      reviewCount: 0,
      createdAt: serverTimestamp()
    });
    
    return { success: true };
}

/**
 * Adds a new review to Firestore with 'pending' status for moderation.
 */
export async function addReview(data: Omit<Review, 'id' | 'createdAt' | 'status'>) {
    await addDoc(collection(db, 'reviews'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return { success: true };
}

/**
 * Fetches the list of zones for Berekum from Firestore.
 */
export async function getBerekumZones(): Promise<string[]> {
  const docRef = doc(db, "locations", "berekum");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists() && docSnap.data().zones) {
    return docSnap.data().zones as string[];
  }
  // Fallback if the document doesn't exist yet
  return [
    "Kato", "Jinijini Road", "Zongo", "Market Area",
    "Presby", "Biadan", "Senase", "Kutre No.1", "Amasu", "Mpatasie",
  ];
}
