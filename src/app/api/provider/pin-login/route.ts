
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { phone, pin } = await req.json();

    if (!phone || !pin) {
      return NextResponse.json(
        { error: 'Phone and PIN are required.' },
        { status: 400 }
      );
    }

    // Normalize phone number to local format for lookup
    const normalizedPhone = phone.startsWith('+233')
      ? '0' + phone.substring(4)
      : phone;

    const snapshot = await adminDb
      .collection('providers')
      .where('phone', '==', normalizedPhone)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Invalid phone number or PIN.' },
        { status: 401 }
      );
    }

    const providerDoc = snapshot.docs[0];
    const providerData = providerDoc.data();

    // Check PIN (plain text comparison as requested by the current schema)
    if (providerData.loginPin !== pin) {
      return NextResponse.json(
        { error: 'Invalid phone number or PIN.' },
        { status: 401 }
      );
    }

    // Determine the correct UID to use (existing auth UID or fallback to document ID)
    const targetUid = providerData.authUid || providerData.uid || providerDoc.id;

    // Set/Update custom claims to ensure role is present
    await adminAuth.setCustomUserClaims(targetUid, { role: 'provider' });

    // Create a custom token for the client to sign in
    // We include the role in the custom token claims for immediate availability
    const customToken = await adminAuth.createCustomToken(targetUid, { role: 'provider' });

    return NextResponse.json({ token: customToken });

  } catch (error: any) {
    console.error('Provider login API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
