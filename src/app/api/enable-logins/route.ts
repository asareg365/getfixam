import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Emergency Master Reset: Enables all logins and clears lockouts.
 */
export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Admin DB not initialized' }, { status: 500 });
    }

    const settingsRef = adminDb.collection('system_settings').doc('admin');
    await settingsRef.set({
      providerLoginsDisabled: false,
      adminLocked: false,
      reason: 'Emergency master reset via API route.',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true, message: 'All logins have been re-enabled and lockouts cleared.' });

  } catch (error) {
    console.error("Error enabling logins:", error);
    return NextResponse.json({ success: false, message: 'Failed to enable logins.' }, { status: 500 });
  }
}
