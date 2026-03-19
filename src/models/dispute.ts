import { Timestamp } from 'firebase/firestore';

export interface Dispute {
  id: string;
  engagementId: string;
  openedBy: "customer" | "provider";

  reason: string;
  description: string;

  status:
    | "opened"
    | "under_review"
    | "resolved_refund"
    | "resolved_release"
    | "rejected";

  resolutionNote?: string;

  createdAt: Timestamp;
  resolvedAt?: Timestamp;
}
