import type { Category } from './types';

/**
 * Static Artisan Categories
 * These are used as defaults and fallbacks throughout the system.
 */
export const CATEGORIES: Category[] = [
  { id: 'electrician', name: 'Electrician', slug: 'electrician', icon: 'Zap' },
  { id: 'plumber', name: 'Plumber', slug: 'plumber', icon: 'Wrench' },
  { id: 'carpenter', name: 'Carpenter', slug: 'carpenter', icon: 'Hammer' },
  { id: 'beautician', name: 'Beautician', slug: 'beautician', icon: 'Sparkles' },
  { id: 'mechanic', name: 'Mechanic', slug: 'mechanic', icon: 'Car' },
  { id: 'phone-repair', name: 'Phone Repair', slug: 'phone-repair', icon: 'Smartphone' },
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
