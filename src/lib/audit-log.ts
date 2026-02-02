'use server';

import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

type LogAdminActionParams = {
  adminEmail: string;
  action: string;
  targetType: 'provider' | 'review' | 'service' | 'system';
  targetId: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Logs an administrative action to the auditLogs collection in Firestore.
 * @param {LogAdminActionParams} params - The parameters for the log entry.
 */
export async function logAdminAction(params: LogAdminActionParams) {
  const { adminEmail, action, targetType, targetId, ipAddress, userAgent } = params;
  
  try {
    await adminDb.collection('auditLogs').add({
      adminEmail,
      action,
      targetType,
      targetId,
      ipAddress,
      userAgent,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to write to admin audit log:", error);
    // This failure is not surfaced to the user to avoid confusing them.
    // It's a background process.
  }
}

type LogProviderActionParams = {
  providerId: string;
  action: string;
  ipAddress: string;
  userAgent: string;
};

/**
 * Logs a provider action to the provider_logs collection in Firestore.
 * @param {LogProviderActionParams} params - The parameters for the log entry.
 */
export async function logProviderAction(params: LogProviderActionParams) {
  const { providerId, action, ipAddress, userAgent } = params;

  try {
    await adminDb.collection('provider_logs').add({
      providerId,
      action,
      ipAddress,
      userAgent,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to write to provider log:", error);
  }
}
