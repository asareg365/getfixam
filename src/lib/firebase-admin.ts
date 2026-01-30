import admin from 'firebase-admin';

// In a Google Cloud environment like App Hosting, `applicationDefault()`
// will automatically find the project ID and service account credentials.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export { admin };
