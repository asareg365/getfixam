import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  try {
    initializeApp({
      credential: applicationDefault(),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
    throw new Error('Firebase admin initialization failed. This can happen if the environment is not configured correctly with service account credentials.');
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
