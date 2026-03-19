import { Timestamp } from 'firebase/firestore';

export interface Engagement {
  id: string;

  customerId: string;
  providerId: string;

  serviceTitle: string;
  description: string;

  currency: "GHS";
  jobAmount: number;

  commissionPercentage: number;
  commissionAmount: number;
  providerReceivable: number;

  jobStatus:
    | "requested"
    | "quoted"
    | "awaiting_payment"
    | "funded"
    | "in_progress"
    | "awaiting_confirmation"
    | "completed"
    | "disputed"
    | "cancelled";

  escrowStatus:
    | "unfunded"
    | "funded"
    | "locked"
    | "released"
    | "refunded";

  paymentReference?: string;
  payoutReference?: string;

  fundedAt?: Timestamp;
  completedAt?: Timestamp;
  releasedAt?: Timestamp;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
