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

export async function getCategories(): Promise<Category[]> {
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
