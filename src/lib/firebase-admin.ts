import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

let adminAuth: any = null;
let adminDb: any = null;

/**
 * Robust initialization for Firebase Admin SDK.
 * Prioritizes the service account from environment variable to ensure signing capabilities (createCustomToken).
 * If no valid credentials are found, it remains null to allow graceful fallbacks to static data.
 */
function getAdminApp(): App | null {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = firebaseConfig.projectId;
  if (!projectId) return null;

  // Combine strategies with robust string validation
  const saJson = process.env.SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  
  if (saJson && saJson !== 'null' && saJson !== 'undefined' && saJson.trim().startsWith('{')) {
    try {
      const serviceAccount = JSON.parse(saJson);
      if (serviceAccount && serviceAccount.private_key) {
        return initializeApp({
          credential: cert(serviceAccount),
          projectId,
        });
      }
    } catch (e) {
      console.warn('[Firebase Admin] Failed to parse Service Account JSON. Admin features will be limited.');
    }
  }

  // Strategy 3: Local Prototyping Fallback (No Credentials)
  // We only attempt this if we are not in a production-like environment to avoid "payload null" crashes
  // deep in the Google Auth library when performing Firestore operations.
  if (process.env.NODE_ENV === 'development') {
      try {
          return initializeApp({ projectId });
      } catch (e) {
          return null;
      }
  }

  return null;
}

try {
  const app = getAdminApp();
  if (app) {
    adminAuth = getAuth(app);
    adminDb = getFirestore(app);
  }
} catch (error) {
  console.error('[Firebase Admin] Critical initialization error:', error);
}

export { adminAuth, adminDb };
