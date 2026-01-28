import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error('Firebase Admin SDK service account credentials are not set in environment variables.');
  }
  
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
    throw new Error('Firebase admin initialization failed. Please check your service account credentials.');
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
