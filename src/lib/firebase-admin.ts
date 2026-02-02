import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let adminDb: Firestore | null;
let adminAuth: Auth | null;

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

// Check for missing environment variables
if (!privateKey || !projectId || !clientEmail) {
  // In a production environment, this is a fatal error and the app should not start.
  if (process.env.NODE_ENV === 'production') {
    throw new Error("CRITICAL: One or more Firebase Admin SDK environment variables are not set. The application cannot function in production.");
  } else {
    // In development or during build, we can warn but should not crash the process.
    console.warn("Firebase Admin SDK credentials not found. This is expected during some build steps, but will cause runtime errors if Admin SDK is used on the server.");
    adminDb = null;
    adminAuth = null;
  }
} else {
  // If credentials are present, initialize the app
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
}

export { adminDb, adminAuth };
