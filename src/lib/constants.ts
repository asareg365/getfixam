import type { Category } from './types';

/**
 * Static Artisan Categories
 * These are used as defaults and fallbacks throughout the system.
 */
export const CATEGORIES: Category[] = [
  { id: 'architectures', name: "Architectures'", slug: 'architectures', icon: 'Hammer' },
  { id: 'bakers', name: "Baker's", slug: 'bakers', icon: 'Sparkles' },
  { id: 'beautician', name: 'Beautician', slug: 'beautician', icon: 'Sparkles' },
  { id: 'carpenter', name: 'Carpenter', slug: 'carpenter', icon: 'Hammer' },
  { id: 'electrician', name: 'Electrician', slug: 'electrician', icon: 'Zap' },
  { id: 'fashion-designers', name: 'Fashion Designers', slug: 'fashion-designers', icon: 'Shirt' },
  { id: 'furniture-makers', name: 'Furniture Makers', slug: 'furniture-makers', icon: 'Hammer' },
  { id: 'gardeners', name: 'Gardeners', slug: 'gardeners', icon: 'Wrench' },
  { id: 'glass-workers', name: 'Glass Workers', slug: 'glass-workers', icon: 'Wrench' },
  { id: 'home-decorators', name: 'Home Decorators', slug: 'home-decorators', icon: 'Sparkles' },
  { id: 'mechanic', name: 'Mechanic', slug: 'mechanic', icon: 'Car' },
  { id: 'metal-workers', name: 'Metal Workers', slug: 'metal-workers', icon: 'Hammer' },
  { id: 'painters', name: 'Painters', slug: 'painters', icon: 'Sparkles' },
  { id: 'phone-repair', name: 'Phone Repair', slug: 'phone-repair', icon: 'Smartphone' },
  { id: 'photographers', name: 'Photographers/Videographers', slug: 'photographers', icon: 'Tv2' },
  { id: 'plumber', name: 'Plumber', slug: 'plumber', icon: 'Wrench' },
  { id: 'shoemakers', name: 'Shoemakers', slug: 'shoemakers', icon: 'Hammer' },
  { id: 'tilers', name: 'Tilers', slug: 'tilers', icon: 'Hammer' },
  { id: 'tv-repair', name: 'TV Repairers', slug: 'tv-repair', icon: 'Tv2' },
];

/**
 * Geographic regions supported by the platform.
 */
export async function getRegions(): Promise<string[]> {
  return ["Bono Region"];
}

/**
 * Neighborhoods/Zones in Berekum.
 */
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

/**
 * Alias for neighborhoods used by the provider registration flow.
 */
export async function getZones(): Promise<string[]> {
    return getNeighborhoods();
}
