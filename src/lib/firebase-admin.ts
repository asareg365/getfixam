import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// In a Google Cloud environment like App Hosting, `applicationDefault()` is preferred.
// However, initializing with a service account JSON is also common, especially for local development.
// Ensure your environment variables are set correctly if using this method.
if (!getApps().length) {
  // Use applicationDefault credentials in production.
  if (process.env.NODE_ENV === 'production') {
      initializeApp();
  } else {
    // For local development, you might use a service account file.
    // Ensure you have a fallback if environment variables are not set.
    if (process.env.FIREBASE_PRIVATE_KEY) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } else {
        // Fallback for local dev without service account ENV VARS
        // This will likely fail if not in a GCP environment,
        // prompting the developer to set up their local credentials.
        initializeApp();
    }
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
