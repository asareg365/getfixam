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
 * CRITICAL: This is only initialized if environment variables are present.
 * During the Next.js build process, these are missing, so it safely sets them to null.
 */
if (privateKey && projectId && clientEmail) {
  try {
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
  } catch (error) {
    console.error("Firebase Admin SDK Initialization Error:", error);
    adminDb = null;
    adminAuth = null;
  }
} else {
    // Explicitly set to null if environment variables are missing (e.g. during build)
    adminDb = null;
    adminAuth = null;
}

export { adminDb, adminAuth };