import admin from "firebase-admin";

let app;

if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.SERVICE_ACCOUNT_JSON!)
    ),
  });
} else {
  app = admin.app();
}

export const adminAuth = admin.auth(app);
export const adminDb = admin.firestore(app);
