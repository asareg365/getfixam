
/**
 * Firebase Client Configuration
 * These variables must be prefixed with NEXT_PUBLIC_ to be available in the browser.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config presence in development
if (process.env.NODE_ENV === 'development') {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value || value === 'your_api_key_here')
    .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`);

  if (missingKeys.length > 0) {
    console.warn(
      `⚠️ Firebase configuration is incomplete. Missing or default values for: ${missingKeys.join(', ')}. ` +
      `Please check your .env file.`
    );
  }
}
