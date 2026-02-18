import { adminDb } from './firebase-admin';
import { CATEGORIES } from './constants';
import type { Category } from './types';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

/**
 * Server-side utility to fetch categories, merging Firestore 'services' with static defaults.
 * Handles database connectivity issues gracefully by falling back to static constants.
 */
export async function getCategories(): Promise<Category[]> {
  if (adminDb && typeof adminDb.collection === 'function') {
    try {
      // Set a short timeout-like behavior by wrapping in a try/catch
      const snap = await adminDb.collection('services').where('active', '==', true).get();
      if (!snap.empty) {
        const dbCategories = snap.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          name: doc.data().name,
          slug: doc.data().slug,
          icon: doc.data().icon
        }));
        
        const dbSlugs = new Set(dbCategories.map((c: { slug: any; }) => c.slug));
        const filteredStatic = CATEGORIES.filter(c => !dbSlugs.has(c.slug));
        return [...dbCategories, ...filteredStatic];
      }
    } catch (e: any) {
      // Log the error but do not throw, so the UI can still render with static data
      console.warn("[Data] Firestore categories unavailable, using static defaults. Reason:", e.message || 'Auth/Network Error');
    }
  }
  return CATEGORIES;
}

export { CATEGORIES, getRegions, getNeighborhoods, getZones } from './constants';
