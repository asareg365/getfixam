import { Wrench, Zap, Smartphone, Car, Hammer, Scissors } from 'lucide-react';
import type { Category, Provider, Review } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Plumber', slug: 'plumber', icon: Wrench },
  { id: '2', name: 'Electrician', slug: 'electrician', icon: Zap },
  { id: '3', name: 'Phone Repair', slug: 'phone-repair', icon: Smartphone },
  { id: '4', name: 'Mechanic', slug: 'mechanic', icon: Car },
  { id: '5', name: 'Carpenter', slug: 'carpenter', icon: Hammer },
  { id: '6', name: 'Hairdresser', slug: 'hairdresser', icon: Scissors },
];

export const PROVIDERS: Provider[] = [
  {
    id: '1',
    name: 'Kwame Electric Works',
    category: 'Electrician',
    phone: '0241234567',
    whatsapp: '0241234567',
    area: 'Berekum Zongo',
    verified: true,
    rating: 4.8,
    reviewCount: 28,
    createdAt: '2023-01-15T09:30:00Z',
    imageId: 'provider1'
  },
  {
    id: '2',
    name: 'Adjoa Plumbing Solutions',
    category: 'Plumber',
    phone: '0557654321',
    whatsapp: '0557654321',
    area: 'Berekum Biadan',
    verified: true,
    rating: 4.5,
    reviewCount: 12,
    createdAt: '2023-02-20T14:00:00Z',
    imageId: 'provider2'
  },
  {
    id: '3',
    name: 'Gadget Masters Phone Repair',
    category: 'Phone Repair',
    phone: '0209876543',
    whatsapp: '0209876543',
    area: 'Berekum Kato',
    verified: false,
    rating: 4.2,
    reviewCount: 15,
    createdAt: '2023-03-10T11:45:00Z',
    imageId: 'provider3'
  },
  {
    id: '4',
    name: 'Kofi & Sons Auto',
    category: 'Mechanic',
    phone: '0275556677',
    whatsapp: '0275556677',
    area: 'Berekum Senase',
    verified: true,
    rating: 4.9,
    reviewCount: 45,
    createdAt: '2022-11-05T08:00:00Z',
    imageId: 'provider4'
  },
  {
    id: '5',
    name: 'Esi\'s Chic Salon',
    category: 'Hairdresser',
    phone: '0501112233',
    whatsapp: '0501112233',
    area: 'Berekum Zongo',
    verified: true,
    rating: 4.6,
    reviewCount: 32,
    createdAt: '2023-05-01T18:00:00Z',
    imageId: 'provider5'
  },
  {
    id: '6',
    name: 'Nsoroma Carpentry',
    category: 'Carpenter',
    phone: '0263334455',
    whatsapp: '0263334455',
    area: 'Berekum Biadan',
    verified: false,
    rating: 4.0,
    reviewCount: 8,
    createdAt: '2023-04-12T13:20:00Z',
    imageId: 'provider6'
  },
  {
    id: '7',
    name: 'Sparky Electricals',
    category: 'Electrician',
    phone: '0247890123',
    whatsapp: '0247890123',
    area: 'Berekum Kato',
    verified: true,
    rating: 4.7,
    reviewCount: 19,
    createdAt: '2023-06-01T10:00:00Z',
    imageId: 'provider7'
  },
  {
    id: '8',
    name: 'Flow-Right Plumbers',
    category: 'Plumber',
    phone: '0552345678',
    whatsapp: '0552345678',
    area: 'Berekum Senase',
    verified: false,
    rating: 3.9,
    reviewCount: 5,
    createdAt: '2023-08-11T16:00:00Z',
    imageId: 'provider8'
  },
  {
    id: '9',
    name: 'iFix Berekum',
    category: 'Phone Repair',
    phone: '0208765432',
    whatsapp: '0208765432',
    area: 'Berekum Zongo',
    verified: true,
    rating: 4.9,
    reviewCount: 55,
    createdAt: '2023-01-25T12:00:00Z',
    imageId: 'provider9'
  },
  {
    id: '10',
    name: 'FastLane Mechanics',
    category: 'Mechanic',
    phone: '0276543210',
    whatsapp: '0276543210',
    area: 'Berekum Biadan',
    verified: true,
    rating: 4.4,
    reviewCount: 21,
    createdAt: '2022-12-15T09:00:00Z',
    imageId: 'provider10'
  },
  {
    id: '11',
    name: 'Osei Furniture',
    category: 'Carpenter',
    phone: '0265432109',
    whatsapp: '0265432109',
    area: 'Berekum Kato',
    verified: true,
    rating: 4.8,
    reviewCount: 25,
    createdAt: '2023-02-18T11:00:00Z',
    imageId: 'provider11'
  },
  {
    id: '12',
    name: 'Golden Scissors Unisex Salon',
    category: 'Hairdresser',
    phone: '0509876543',
    whatsapp: '0509876543',
    area: 'Berekum Senase',
    verified: false,
    rating: 4.1,
    reviewCount: 18,
    createdAt: '2023-07-22T15:30:00Z',
    imageId: 'provider12'
  },
];

export const REVIEWS: Review[] = [
  {
    id: '1',
    providerId: '1',
    userName: 'Ama K.',
    rating: 5,
    comment: 'Very neat work, came on time and fixed my faulty socket. Highly recommended!',
    createdAt: '2023-10-05T10:00:00Z',
    userImageId: 'user1'
  },
  {
    id: '2',
    providerId: '1',
    userName: 'John O.',
    rating: 4,
    comment: 'Good service, but was a bit late. The work itself was professional.',
    createdAt: '2023-09-28T15:20:00Z',
    userImageId: 'user2'
  },
  {
    id: '3',
    providerId: '2',
    userName: 'Yaw B.',
    rating: 5,
    comment: 'Adjoa is the best plumber in Berekum! Fixed my leaking pipe in no time.',
    createdAt: '2023-11-01T12:00:00Z',
    userImageId: 'user3'
  },
  {
    id: '4',
    providerId: '9',
    userName: 'Fatima I.',
    rating: 5,
    comment: 'My phone screen was shattered. iFix made it look brand new. Fast and affordable.',
    createdAt: '2023-10-20T18:00:00Z',
    userImageId: 'user4'
  },
  {
    id: '5',
    providerId: '9',
    userName: 'David A.',
    rating: 5,
    comment: 'Best phone repair shop in town. Trustworthy and skilled.',
    createdAt: '2023-11-10T11:30:00Z',
    userImageId: 'user5'
  },
  {
    id: '6',
    providerId: '4',
    userName: 'Michael S.',
    rating: 5,
    comment: 'Honest and reliable mechanic. Kofi knows his stuff.',
    createdAt: '2023-08-15T14:45:00Z',
    userImageId: 'user6'
  }
];
