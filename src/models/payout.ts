import { Timestamp } from 'firebase-admin/firestore';

export interface Payout {
  id?: string;
  engagementId: string;
  providerId: string;
  amount: number; // The amount to be paid out to the provider
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  transferDetails?: any; // To store Paystack transfer response
  errorMessage?: string; // If the payout fails
}
