
// /src/lib/services-client.ts
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase-client";

export async function getProvidersByCategory(categorySlug: string) {
  const providersRef = collection(db, "providers"); // your collection
  const q = query(providersRef, where("categorySlug", "==", categorySlug));
  
  const snapshot = await getDocs(q);
  const providers: any[] = [];
  snapshot.forEach(doc => providers.push({ id: doc.id, ...doc.data() }));
  
  return providers;
}
