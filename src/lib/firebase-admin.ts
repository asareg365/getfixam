
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let app;

if (process.env.NODE_ENV === 'production') {
  app = getApps().length === 0 ? initializeApp() : getApps()[0];
} else {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please set it in your .env.local file.');
  }
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  app =
    getApps().length === 0
      ? initializeApp({
          credential: cert(serviceAccount),
        })
      : getApps()[0];
}

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
