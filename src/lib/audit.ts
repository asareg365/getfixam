'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

interface AuditLogParams {
  adminEmail: string;
  action: string;
  targetType: 'provider' | 'job' | 'service';
  targetId: string;
  before?: any;
  after?: any;
}

export async function logAuditEvent({
  adminEmail,
  action,
  targetType,
  targetId,
  before,
  after,
}: AuditLogParams) {
  try {
    await adminDb.collection('audit_logs').add({
      adminEmail,
      action,
      targetType,
      targetId,
      before: before ?? null,
      after: after ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    // Audit logging should NEVER break the main action
    console.error('Audit log failed:', error);
  }
}
