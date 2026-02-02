import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

/**
 * Robust initialization of the Firebase Admin SDK.
 * During the build process (next build), environment variables may be missing.
 * In such cases, we set the instances to null so that consuming functions can
 * gracefully fall back to mock data or skip live database operations.
 */
try {
  if (privateKey && projectId && clientEmail) {
    const app =
      getApps().length === 0
        ? initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          })
        : getApps()[0];

    adminDb = getFirestore(app);
    adminAuth = getAuth(app);
  } else {
    // During local build or if secrets aren't set yet, we log a warning but don't crash.
    if (process.env.NODE_ENV === 'production') {
        console.error("CRITICAL: Firebase Admin credentials missing in production environment.");
    } else {
        console.warn("Firebase Admin SDK: Credentials not found. Build will proceed using fallback data.");
    }
  }
} catch (error) {
  console.error("Firebase Admin SDK Initialization Error:", error);
}

export { adminDb, adminAuth };
