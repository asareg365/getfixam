import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

let adminAuth: any = null;
let adminDb: any = null;

/**
 * Robust initialization for Firebase Admin SDK.
 * Favors environment variables, but falls back to project defaults for workstation stability.
 */
function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = firebaseConfig.projectId;

  try {
    // Attempt 1: Using the provided service account environment variable
    const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (credsJson && credsJson !== 'null' && credsJson !== 'undefined' && credsJson.length > 10) {
      const serviceAccount = JSON.parse(credsJson);
      // CRITICAL: Ensure we have a valid object with required fields for signing capabilities.
      // The "payload must be of type object" error happens when createCustomToken is called
      // but the SDK lacks a private key to sign the JWT.
      if (serviceAccount && typeof serviceAccount === 'object' && serviceAccount.private_key) {
        return initializeApp({
          credential: cert(serviceAccount),
          projectId,
        });
      }
    }
  } catch (e) {
    console.warn('[Firebase Admin] Failed to initialize with service account JSON, trying fallback...', e);
  }

  try {
    // Attempt 2: Initializing with just the Project ID (Standard for Workstations with ADC)
    // Note: createCustomToken will fail if ADC doesn't provide a service account identity with signing keys.
    return initializeApp({ projectId });
  } catch (e) {
    console.error('[Firebase Admin] Failed to initialize with Project ID:', e);
    // Final attempt: No-args initialization (picks up environment defaults)
    return initializeApp();
  }
}

try {
  const app = getAdminApp();
  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
} catch (error) {
  console.error('[Firebase Admin] Critical Error: Admin services could not be established.', error);
}

export { adminAuth, adminDb };
