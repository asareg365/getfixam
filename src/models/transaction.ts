import { Timestamp } from 'firebase/firestore';

export interface Transaction {
  id: string;
  engagementId: string;
  type:
    | "payment"
    | "commission"
    | "payout"
    | "refund";

  amount: number;
  currency: "GHS";

  userId?: string;
  providerId?: string;

  status: "pending" | "success" | "failed";

  reference: string; // Paystack reference

  createdAt: Timestamp;
}
