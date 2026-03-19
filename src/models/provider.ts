import { Timestamp } from 'firebase/firestore';

export interface Provider {
  id: string;
  userId: string;

  businessName: string;
  serviceCategory: string;
  location: string;

  momoNumber?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };

  rating: number;
  totalJobs: number;
  totalEarned: number;
  totalCommissionPaid: number;

  createdAt: Timestamp;
}
