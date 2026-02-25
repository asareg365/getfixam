import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();
    const { phone, pin } = await req.json();

    if (!phone || !pin) {
      return NextResponse.json(
        { error: 'Phone and PIN are required.' },
        { status: 400 }
      );
    }

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

    // ✅ Correct field name
    if (providerData.loginPin !== pin) {
      return NextResponse.json(
        { error: 'Invalid phone number or PIN.' },
        { status: 401 }
      );
    }

    const customToken = await adminAuth.createCustomToken(providerDoc.id);

    return NextResponse.json({ token: customToken });

  } catch (error) {
    console.error('Provider login error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}