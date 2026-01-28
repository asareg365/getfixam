import type { LucideIcon } from "lucide-react";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
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
  authUid?: string;
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
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string; // ISO 8601 date string
  approvedAt?: string;
  featuredUntil?: string; // ISO 8601 date string
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
  status: 'pending' | 'approved' | 'rejected';
};

export type Request = {
  id: string;
  userPhone: string;
  serviceType: string;
  location: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  createdAt: string; // ISO 8601 date string
};
