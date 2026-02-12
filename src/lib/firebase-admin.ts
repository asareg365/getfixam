import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// Import the service account directly from the project root
// In this environment, this file contains the required private_key for token signing
import serviceAccountData from '../../service-account.json';

let adminAuth: any = null;
let adminDb: any = null;

/**
 * Robust initialization for Firebase Admin SDK.
 * Prioritizes the local service-account.json to ensure signing capabilities (createCustomToken).
 */
function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = firebaseConfig.projectId;

  // Strategy 1: Use the explicit service-account.json file if available
  try {
    if (serviceAccountData && (serviceAccountData as any).private_key) {
      return initializeApp({
        credential: cert(serviceAccountData as any),
        projectId,
      });
    }
  } catch (e) {
    // Silent catch during strategy check
  }

  // Strategy 2: Use environment variable
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
    // Silent catch
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
