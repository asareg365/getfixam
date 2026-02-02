import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let adminDb: Firestore | null;
let adminAuth: Auth | null;

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

// Check for missing environment variables.
// In a build environment (like `next build`) or other environments without full credentials,
// we set the admin objects to null and warn the developer.
// Data fetching functions must handle the case where adminDb is null.
if (!privateKey || !projectId || !clientEmail) {
  console.warn("Firebase Admin SDK credentials not found. This is expected during the build process. Admin-dependent features will be disabled or fall back to mock data at build time.");
  adminDb = null;
  adminAuth = null;
} else {
  // If credentials are present, initialize the app.
  // This ensures we don't re-initialize on hot reloads.
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
