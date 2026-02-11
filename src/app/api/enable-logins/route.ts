import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Admin DB not initialized' }, { status: 500 });
    }

    const settingsRef = adminDb.collection('system_settings').doc('admin');
    await settingsRef.set({
      providerLoginsDisabled: false
    }, { merge: true });

    return NextResponse.json({ success: true, message: 'Provider logins have been enabled.' });

  } catch (error) {
    console.error("Error enabling provider logins:", error);
    return NextResponse.json({ success: false, message: 'Failed to enable provider logins.' }, { status: 500 });
  }
}
