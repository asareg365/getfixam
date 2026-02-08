
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic'; // Ensure this route is always executed dynamically

/**
 * This API route checks if provider logins are globally disabled in the system settings.
 * It is designed to be called from environments like Edge middleware where direct DB access
 * with firebase-admin is not possible.
 */
async function areProviderLoginsDisabled(): Promise<boolean> {
  try {
    // As a user suggested, check if adminDb is initialized.
    if (!adminDb) {
      console.error("areProviderLoginsDisabled: Firebase Admin DB is not initialized.");
      // Fail-safe: if we cannot check the setting, we should assume logins are disabled.
      return true;
    }

    const settingsRef = adminDb.collection('system_settings').doc('admin');
    const snap = await settingsRef.get();
    
    if (!snap.exists) {
      // If the setting document doesn't exist, assume not disabled.
      return false;
    }
    
    const data = snap.data()!;
    return data.providerLoginsDisabled === true;

  } catch (error) {
    console.error("Error checking if provider logins are disabled:", error);
    // Fail-safe: If any error occurs during the check, assume logins are disabled.
    return true;
  }
}

export async function GET() {
  const isDisabled = await areProviderLoginsDisabled();
  return NextResponse.json({ isDisabled });
}
