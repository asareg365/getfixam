import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * This API route checks if provider logins are globally disabled in the system settings.
 * During prototyping, we default to false (enabled) if the DB is not fully configured.
 */
async function areProviderLoginsDisabled(): Promise<boolean> {
  try {
    if (!adminDb) {
      // During development/prototyping, we allow logins even if adminDb isn't ready.
      return false;
    }

    const settingsRef = adminDb.collection('system_settings').doc('admin');
    const snap = await settingsRef.get();
    
    if (!snap.exists) {
      // Default to enabled if the document isn't there yet.
      return false;
    }
    
    const data = snap.data()!;
    return data.providerLoginsDisabled === true;

  } catch (error) {
    console.error("Error checking if provider logins are disabled:", error);
    // Safe default for prototyping
    return false;
  }
}

export async function GET() {
  const isDisabled = await areProviderLoginsDisabled();
  return NextResponse.json({ isDisabled });
}
