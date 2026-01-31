'use server';

import { admin } from './firebase-admin';

type LogAdminActionParams = {
  adminEmail: string;
  action: string;
  targetType: 'provider' | 'review' | 'service';
  targetId: string;
  details?: Record<string, any>;
}

/**
 * Logs an administrative action to the auditLogs collection in Firestore.
 * @param {LogAdminActionParams} params - The parameters for the log entry.
 */
export async function logAdminAction(params: LogAdminActionParams) {
  const { adminEmail, action, targetType, targetId, details } = params;
  
  try {
    await admin.firestore().collection('auditLogs').add({
      adminEmail,
      action,
      targetType,
      targetId,
      details: details || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to write to audit log:", error);
    // This failure is not surfaced to the user to avoid confusing them.
    // It's a background process.
  }
}
