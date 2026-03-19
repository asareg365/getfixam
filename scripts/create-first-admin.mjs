
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import prompts from 'prompts';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function createSuperAdmin() {
  console.log('Starting the super admin creation process...');

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
  const db = getFirestore();

  // --- Check if an admin already exists ---
  try {
    const adminsCollection = db.collection('admins');
    const snapshot = await adminsCollection.limit(1).get();
    if (!snapshot.empty) {
      console.warn('\nWARNING: An admin user already exists.');
      const { proceed } = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: 'Do you still want to create a new super admin?',
        initial: false
      });
      if (!proceed) {
        console.log('Operation cancelled.');
        process.exit(0);
      }
    }
  } catch (error) {
    console.error('\nERROR: Could not check for existing admins.', error);
    process.exit(1);
  }

  // --- Get New Admin Credentials from User ---
  const questions = [
    {
      type: 'text',
      name: 'email',
      message: 'Enter the email for the new super admin:'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter a temporary password (at least 6 characters):'
    }
  ];

  const response = await prompts(questions);

  if (!response.email || !response.password || response.password.length < 6) {
    console.error('\nERROR: Email and a password of at least 6 characters are required.');
    process.exit(1);
  }
  
  // --- Create User and Set Admin Record ---
  try {
    console.log(`\nAttempting to create user: ${response.email}...`);

    // 1. Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: response.email,
      password: response.password
    });
    console.log(`Successfully created user with UID: ${userRecord.uid}`);

    // 2. Create Firestore admin document
    const adminDocRef = db.collection('admins').doc(userRecord.uid);
    await adminDocRef.set({
      email: userRecord.email,
      role: 'super_admin',
      active: true,
      createdAt: new Date(),
    });
    console.log(`Successfully created Firestore admin record for UID: ${userRecord.uid}`);
    
    // 3. Set custom claim for the new admin user
    await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
    console.log(`Successfully set custom claim for UID: ${userRecord.uid}`);

    console.log('\n✅ Super admin created successfully! ✅');
    console.log('You can now log in using the credentials you provided.');
    console.log('IMPORTANT: For security, you should now remove the first-login logic from the admin login page.');

  } catch (error) {
    console.error('\nERROR: Failed to create super admin.', error);
    process.exit(1);
  }
}

createSuperAdmin();
