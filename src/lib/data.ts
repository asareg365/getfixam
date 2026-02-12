import { adminDb } from './firebase-admin';
import { CATEGORIES } from './constants';
import type { Category } from './types';

/**
 * Server-side utility to fetch categories, merging Firestore 'services' with static defaults.
 * This function should only be called in Server Components or Server Actions.
 */
export async function getCategories(): Promise<Category[]> {
  if (adminDb && typeof adminDb.collection === 'function') {
    try {
      const snap = await adminDb.collection('services').where('active', '==', true).get();
      if (!snap.empty) {
        const dbCategories = snap.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          slug: doc.data().slug,
          icon: doc.data().icon
        }));
        
        // Merge: prefer DB categories if slugs match, otherwise keep static ones
        const dbSlugs = new Set(dbCategories.map(c => c.slug));
        const filteredStatic = CATEGORIES.filter(c => !dbSlugs.has(c.slug));
        return [...dbCategories, ...filteredStatic];
      }
    } catch (e) {
      console.warn("Could not fetch categories from Firestore, using defaults.", e);
    }
  }
  return CATEGORIES;
}

// Re-export constants for server components that use this file
export { CATEGORIES, getRegions, getNeighborhoods, getZones } from './constants';
