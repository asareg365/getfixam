import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// In a Google Cloud environment like App Hosting, `applicationDefault()`
// will automatically find the project ID and service account credentials.
// We only initialize the app if it hasn't been already.
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
