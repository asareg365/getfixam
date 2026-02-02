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
  performanceScore?: number;
  jobsCompleted?: number;
  jobsCancelled?: number;
  avgResponseTime?: number;
  failedLogins?: number;
};

export type Review = {
  id: string;
  jobId: string;
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
  customerId: string;
  providerId: string;
  categoryId: string;
  description: string;
  location: string;
  estimatedCost?: number;
  price?: number;
  surgeMultiplier?: number;
  status: 'REQUESTED' | 'QUOTED' | 'AWAITING_DEPOSIT' | 'IN_PROGRESS' | 'AWAITING_FINAL_PAYMENT' | 'COMPLETED' | 'CLOSED' | 'DISPUTED' | 'CANCELLED';
  createdAt: string;
  expiresAt?: string;
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

export type WhatsAppEvent = {
    id: string;
    phone: string;
    role: 'provider' | 'customer';
    event: 'JOB_REQUEST' | 'PROVIDER_LOGIN' | 'HELP' | 'PIN_RESET';
    message: string;
    createdAt: string;
}

export type Transaction = {
    id: string;
    jobId: string;
    providerId: string;
    jobAmount: number;
    commission: number;
    status: 'paid' | 'unpaid' | 'pending';
    createdAt: string;
}
    
export type Payment = {
    id: string;
    jobId: string;
    type: 'DEPOSIT' | 'FINAL';
    amount: number;
    method: 'MoMo' | 'Cash' | 'WhatsApp';
    paidBy: 'customer';
    status: 'CONFIRMED' | 'PENDING';
    createdAt: string;
};

export type Subscription = {
    id: string;
    providerId: string;
    plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
    expiresAt: string;
    status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
};

export type Dispute = {
    id: string;
    jobId: string;
    openedBy: 'customer' | 'provider';
    reason: string;
    description: string;
    status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
    evidence: {
        type: 'image' | 'video' | 'text';
        url: string;
    }[];
    createdAt: string;
};

export type Wallet = {
    id: string; // Corresponds to a userId (provider or customer)
    balance: number;
    pending: number;
};

export type WalletTransaction = {
    id: string;
    walletId: string;
    jobId: string;
    type: 'ESCROW_HOLD' | 'ESCROW_RELEASE' | 'PAYOUT' | 'TOPUP';
    amount: number;
    status: 'LOCKED' | 'COMPLETED' | 'FAILED' | 'PENDING';
};

export type JobProof = {
    id: string;
    jobId: string;
    stage: 'BEFORE' | 'DURING' | 'AFTER';
    uploadedBy: 'provider' | 'customer';
    images: string[];
    timestamp: string;
};
