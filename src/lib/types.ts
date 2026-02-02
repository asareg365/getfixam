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
  basePrice: number;
  currency: string;
  maxSurge?: number;
  minSurge?: number;
};

export type Provider = {
  id: string;
  authUid?: string;
  name: string;
  category: string;
  serviceId: string;
  phone: string;
  whatsapp: string;
  digitalAddress: string;
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
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  loginPinHash?: string;
  loginPinCreatedAt?: string;
  updatedAt?: string;
  services?: { name: string; active: boolean; price?: number }[];
  availability?: {
      [day: string]: { from: string; to: string };
  };
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
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
};

export type Request = {
  id: string;
  userPhone: string;
  serviceType: string;
  location: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  createdAt: string; // ISO 8601 date string
};

export type Prediction = {
  topService: [string, number];
  topArea: [string, number];
  confidence: string;
  basedOnDays: number;
  generatedAt: string;
};

export type StandbyPrediction = {
  serviceType: string;
  area: string;
  artisans: Provider[];
  generatedAt: string;
};

export type Job = {
  id: string;
  serviceType: string;
  area: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'reassigned' | 'completed' | 'unassigned';
  assignedTo: string; // artisanId
  attemptedArtisans: string[]; // array of artisanIds
  createdAt: string;
  expiresAt: string;
  price?: number;
  surgeMultiplier?: number;
};

export type ReassignmentLog = {
  id: string;
  jobId: string;
  fromArtisan: string;
  toArtisan: string;
  reason: 'timeout' | 'rejected';
  timestamp: string;
};

export type ProviderLog = {
  id: string;
  providerId: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
    


    


