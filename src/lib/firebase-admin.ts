import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
    throw new Error('Firebase admin initialization failed. This can happen if the environment is not configured correctly with service account credentials.');
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
