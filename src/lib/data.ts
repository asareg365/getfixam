import { adminDb } from './firebase-admin';

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

export const CATEGORIES: Category[] = [
  { id: 'electrician', name: 'Electrician', slug: 'electrician', icon: 'Zap' },
  { id: 'plumber', name: 'Plumber', slug: 'plumber', icon: 'Wrench' },
  { id: 'carpenter', name: 'Carpenter', slug: 'carpenter', icon: 'Hammer' },
  { id: 'beautician', name: 'Beautician', slug: 'beautician', icon: 'Sparkles' },
  { id: 'mechanic', name: 'Mechanic', slug: 'mechanic', icon: 'Car' },
  { id: 'phone-repair', name: 'Phone Repair', slug: 'phone-repair', icon: 'Smartphone' },
];

/**
 * Fetches categories, merging Firestore 'services' with static defaults.
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

export async function getRegions(): Promise<string[]> {
  return ["Bono Region"];
}

export async function getNeighborhoods(): Promise<string[]> {
    return [
        "Biadan",
        "Kato",
        "Koraso",
        "Senase",
        "Anyimon",
        "Mpatasie",
        "Fetentaa",
        "Berekum Central",
        "Ahenbronoso"
    ];
}

export async function getZones(): Promise<string[]> {
    return getNeighborhoods();
}
