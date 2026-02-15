import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

let adminAuth: any = null;
let adminDb: any = null;

/**
 * Robust initialization for Firebase Admin SDK.
 * Prioritizes the service account from environment variable to ensure signing capabilities (createCustomToken).
 */
function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = firebaseConfig.projectId;

  // Strategy 1: Use the environment variable (CI/CD or production)
  try {
    const serviceAccountJson = process.env.SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      if (serviceAccount && serviceAccount.private_key) {
        return initializeApp({
          credential: cert(serviceAccount),
          projectId,
        });
      }
    }
  } catch (e) {
    console.warn('[Firebase Admin] Strategy 1 failed:', e);
  }

  // Strategy 2: Use legacy GOOGLE_APPLICATION_CREDENTIALS_JSON if available
  try {
    const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (credsJson && credsJson !== 'null' && credsJson !== 'undefined' && credsJson.length > 10) {
      const serviceAccount = JSON.parse(credsJson);
      if (serviceAccount && serviceAccount.private_key) {
        return initializeApp({
          credential: cert(serviceAccount),
          projectId,
        });
      }
    }
  } catch (e) {
    console.warn('[Firebase Admin] Strategy 2 failed:', e);
  }

  // Strategy 3: Project ID fallback (Limited functionality - createCustomToken will likely fail)
  try {
    return initializeApp({ projectId });
  } catch (e) {
    return initializeApp();
  }
}

try {
  const app = getAdminApp();
  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
} catch (error) {
  console.error('[Firebase Admin] Critical initialization error:', error);
}

export { adminAuth, adminDb };
