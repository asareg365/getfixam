
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function setAdminClaim() {
  console.log('Starting the set admin claim process...');

  // --- Get Service Account from Environment ---
  const serviceAccountJson = process.env.SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.error('\nERROR: SERVICE_ACCOUNT_JSON is not set in your .env.local file.');
    console.error('Please ensure your service account key is correctly set up.');
    process.exit(1);
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (error) {
    console.error('\nERROR: Failed to parse SERVICE_ACCOUNT_JSON.');
    console.error('Please check the format of the JSON in your .env.local file.');
    process.exit(1);
  }
  
  // --- Initialize Firebase Admin SDK ---
  try {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('\nERROR: Firebase Admin SDK initialization failed.', error);
    process.exit(1);
  }

  const auth = getAuth();
  const uid = "8YvzSpEGjKUVhJdu1RZZ0yywkkA3";

  try {
    console.log(`Setting custom claim for user: ${uid}`);
    await auth.setCustomUserClaims(uid, { role: "admin" });
    console.log(`\n✅ Successfully set custom claim for user: ${uid}`);

    // Optional: verify the claim was set
    const userRecord = await auth.getUser(uid);
    console.log('Custom claims for user:', userRecord.customClaims);

  } catch (error) {
    console.error(`\nERROR: Failed to set custom claim for user ${uid}.`, error);
    process.exit(1);
  }
}

setAdminClaim();
