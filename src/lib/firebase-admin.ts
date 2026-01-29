import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
    projectId: 'studio-1004537855-178e0',
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
