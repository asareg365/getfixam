import type { LucideIcon } from "lucide-react";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon | any; // Can be LucideIcon or a string for emoji
};

export type Service = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  active: boolean;
};

export type Provider = {
  id: string;
  name: string;
  category: string;
  serviceId: string;
  phone: string;
  whatsapp: string;
  location: {
    region: string;
    city: string;
    zone: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  verified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string; // ISO 8601 date string
  approvedAt?: string;
  imageId: string;
};

export type Review = {
  id: string;
  providerId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string; // ISO 8601 date string
  userImageId: string;
};
