import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// In a Google Cloud environment like App Hosting, `applicationDefault()` is preferred.
// However, initializing with a service account JSON is also common, especially for local development.
// This logic prioritizes environment variables and falls back to Application Default Credentials.
if (!getApps().length) {
    if (process.env.FIREBASE_PRIVATE_KEY) {
        // Use service account credentials if provided (e.g., in .env.local)
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Ensure the private key is correctly formatted
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
    } else {
        // Otherwise, use Application Default Credentials (for production on GCP)
        // This will fail in a local environment if GOOGLE_APPLICATION_CREDENTIALS is not set.
        console.warn("Firebase Admin SDK: No FIREBASE_PRIVATE_KEY found. Falling back to Application Default Credentials.");
        initializeApp();
    }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
