import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

let adminAuth: any = null;
let adminDb: any = null;

try {
  let app: App;

  if (!getApps().length) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: firebaseConfig.projectId,
      });
    } else {
      // Attempt initialization with explicit project ID for better stability in workstations
      app = initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
  } else {
    app = getApps()[0];
  }

  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
} catch (error) {
  // Graceful degradation during prototyping
  console.warn('[Firebase Admin] Initialization skipped or failed. Admin-only features might be limited.', error);
}

export { adminAuth, adminDb };
