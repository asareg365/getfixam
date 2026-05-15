
import type { Category } from './types';

/**
 * Static Artisan Categories
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
  { id: 'other', name: 'Other (Please specify)', slug: 'other', icon: 'Plus' },
];

export type CityConfig = {
    id: string;
    name: string;
    region: string;
    neighborhoods: string[];
};

/**
 * City Specific Data
 */
export const CITIES: Record<string, CityConfig> = {
    berekum: {
        id: "berekum",
        name: "Berekum",
        region: "Bono Region",
        neighborhoods: [
            "Adom", "Adom Newtown", "Ahenbronoso", "Amomaso", "Anyimon", "Ayakorase", "Benkasa", "Berekum Central", "Biadan", "Brenyekwa", "Fetentaa", "Jamdede", "Jinijini", "Kato", "Koraso", "Kyeritwedie", "Magazine", "Mpatapo", "Mpatasie", "Nanasuano", "New Biadan", "Nsapor", "Nyamebekyere", "Nyametease", "Senase", "Sofokyere", "World of Friends", "Zongo"
        ]
    },
    accra: {
        id: "accra",
        name: "Accra",
        region: "Greater Accra",
        neighborhoods: [
            "Abeka", "Abelemkpe", "Ablekuma", "Abossey Okai", "Accra Central", "Accra New Town", "Achimota", "Adabraka", "Adenta", "Airport Residential", "Akweteyman", "Alajo", "Amanfro", "Ashaley Botwe", "Ashiaman", "Asylum Down", "Atico", "Awoshie", "Baatsona", "Bubuashie", "Cantonments", "Chorkor", "Circle", "Dansoman", "Darkuman", "Dzorwulu", "East Legon", "East Legon Hills", "Gbawe", "Haatso", "James Town", "Kaneshie", "Kanda", "Kokomlemle", "Korle Bu", "Korle Gonno", "Kwame Nkrumah Interchange", "Kwabenya", "Labadi", "Labone", "Lapaz", "Lartebiokorshie", "Legon", "Madina", "Makola", "Mallam", "Mamobi", "Mamprobi", "Mataheko", "Nii Boi Town", "Nima", "North Ridge", "Nungua", "Odorkor", "Osu", "Oyarifa", "Pokuase", "Ridge", "Sakumono", "Santa Maria", "Sowutuom", "Spintex", "Taifa", "Tantra Hill", "Tesano", "Teshie", "Upper Weija", "West Legon"
        ]
    }
};

export const NEIGHBORHOODS = CITIES.berekum.neighborhoods; // Backward compatibility

export async function getRegions(): Promise<string[]> {
  return ["Bono Region", "Greater Accra"];
}

export function getCityConfig(cityId: string = 'berekum'): CityConfig {
    const id = cityId.toLowerCase();
    return CITIES[id] || CITIES.berekum;
}

export async function getNeighborhoods(cityId?: string): Promise<string[]> {
    return getCityConfig(cityId).neighborhoods;
}

export async function getZones(cityId?: string): Promise<string[]> {
    return getCityConfig(cityId).neighborhoods;
}
