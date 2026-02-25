import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (!getApps().length) {
    const serviceAccountJson = process.env.SERVICE_ACCOUNT_JSON;

    if (!serviceAccountJson) {
      console.error("SERVICE_ACCOUNT_JSON environment variable is not set.");
      throw new Error("SERVICE_ACCOUNT_JSON environment variable is not set.");
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } catch (error) {
      console.error("Error parsing SERVICE_ACCOUNT_JSON:", error);
      throw new Error("Error parsing SERVICE_ACCOUNT_JSON.");
    }
  }

  return getApps()[0];
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
