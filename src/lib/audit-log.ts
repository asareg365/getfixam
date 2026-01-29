import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

interface AuditLogInput {
  action: string;
  entityType: 'provider' | 'job' | 'service';
  entityId: string;
  performedBy: string;
  performedByUid: string;
  metadata?: Record<string, any>;
}

export async function logAuditEvent({
  action,
  entityType,
  entityId,
  performedBy,
  performedByUid,
  metadata = {},
}: AuditLogInput) {
  try {
    await adminDb.collection('audit_logs').add({
      action,
      entityType,
      entityId,
      performedBy,
      performedByUid,
      metadata,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    // Audit logging should NEVER break the main action
    console.error('Audit log failed:', error);
  }
}
