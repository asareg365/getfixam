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
 * Safely handles cases where the Admin SDK is not initialized.
 */
export async function logAdminAction(params: LogAdminActionParams) {
  if (!adminDb || typeof adminDb.collection !== 'function') {
    console.log("Audit Log (Simulated):", params);
    return;
  }

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
 */
export async function logProviderAction(params: LogProviderActionParams) {
  if (!adminDb || typeof adminDb.collection !== 'function') {
    console.log("Provider Log (Simulated):", params);
    return;
  }

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
