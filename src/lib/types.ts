import type { LucideIcon } from "lucide-react";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon | any; // Can be LucideIcon or a string for emoji
};

export type Provider = {
  id: string;
  name: string;
  category: string;
  phone: string;
  whatsapp: string;
  area: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string; // ISO 8601 date string
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
