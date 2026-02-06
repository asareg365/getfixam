import { cache } from 'react';

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

export const CATEGORIES: Category[] = [
  { id: 'aluminum-fabricator', name: 'Aluminum Fabricator', slug: 'aluminum-fabricator', icon: 'Hammer' },
  { id: 'beautician', name: 'Beautician', slug: 'beautician', icon: 'Sparkles' },
  { id: 'carpenter', name: 'Carpenter', slug: 'carpenter', icon: 'Hammer' },
  { id: 'electrician', name: 'Electrician', slug: 'electrician', icon: 'Zap' },
  { id: 'fashion-designer', name: 'Fashion Designer', slug: 'fashion-designer', icon: 'Shirt' },
  { id: 'hairdresser', name: 'Hairdresser', slug: 'hairdresser', icon: 'Scissors' },
  { id: 'masonry', name: 'Masonry', slug: 'masonry', icon: 'Hammer' },
  { id: 'mechanic', name: 'Mechanic', slug: 'mechanic', icon: 'Car' },
  { id: 'metal-fabricator', name: 'Metal Fabricator', slug: 'metal-fabricator', icon: 'Hammer' },
  { id: 'phone-repair', name: 'Phone Repair', slug: 'phone-repair', icon: 'Smartphone' },
  { id: 'plumber', name: 'Plumber', slug: 'plumber', icon: 'Wrench' },
  { id: 'tiller', name: 'Tiller', slug: 'tiller', icon: 'Hammer' },
  { id: 'tv-repair', name: 'TV Repair', slug: 'tv-repair', icon: 'Tv2' },
];

export const getCategories = cache(async (): Promise<Category[]> => {
    return CATEGORIES.sort((a, b) => a.name.localeCompare(b.name));
});

export async function getZones(): Promise<string[]> {
    return [
      "Zone A",
      "Zone B",
      "Zone C",
      "Zone D",
      "Zongo",
      "Central",
      "Suburb North",
      "Suburb South"
    ];
}