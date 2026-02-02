
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import bcrypt from 'bcrypt';
import { logProviderAction } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+233')) return phone;
    if (phone.startsWith('0')) return `+233${phone.substring(1)}`;
    return `+233${phone}`;
  };

  try {
    const { phone: rawPhone, pin } = await req.json();

    if (!rawPhone || !pin) {
      return NextResponse.json({ success: false, message: 'Phone number and PIN are required.' }, { status: 400 });
    }
    
    // Find provider by phone number
    const providersRef = adminDb.collection('providers');
    const q = providersRef.where('phone', '==', rawPhone).limit(1);
    const providerSnap = await q.get();

    if (providerSnap.empty) {
        return NextResponse.json({ success: false, message: 'Account not found for this phone number.' }, { status: 404 });
    }

    const providerDoc = providerSnap.docs[0];
    const providerData = providerDoc.data();
    
    // Security checks
    if (providerData.status !== 'approved') {
        return NextResponse.json({ success: false, message: `Your account is currently ${providerData.status}.` }, { status: 403 });
    }
    if (!providerData.loginPinHash) {
        return NextResponse.json({ success: false, message: 'This account is not eligible for PIN login. This might be because you have already used your one-time PIN.' }, { status: 403 });
    }

    // Verify PIN
    const pinMatch = await bcrypt.compare(pin, providerData.loginPinHash);
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    if (!pinMatch) {
        await logProviderAction({ providerId: providerDoc.id, action: 'PROVIDER_LOGIN_FAILED_PIN', ipAddress, userAgent });
        return NextResponse.json({ success: false, message: 'The PIN you entered is incorrect.' }, { status: 401 });
    }
    
    // PIN is correct. Now, create a custom token.
    const formattedPhone = formatPhoneNumber(rawPhone);
    let user;

    // Get or create the Firebase Auth user associated with this phone number.
    try {
        user = await adminAuth.getUserByPhoneNumber(formattedPhone);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            user = await adminAuth.createUser({ phoneNumber: formattedPhone, displayName: providerData.name });
        } else {
            throw error; // Re-throw other errors
        }
    }

    // If the authUid on the provider doc doesn't match the found user, update it.
    if (providerData.authUid !== user.uid) {
        await providerDoc.ref.update({ authUid: user.uid });
    }
    
    // Generate an ID token. We will create a session cookie from this on the client.
    const customToken = await adminAuth.createCustomToken(user.uid);

    // After successful PIN verification, nullify the PIN
    await providerDoc.ref.update({
        loginPinHash: null,
        loginPinCreatedAt: null,
    });
    
    await logProviderAction({
        providerId: providerDoc.id,
        action: 'PROVIDER_LOGIN_SUCCESS_PIN',
        ipAddress,
        userAgent,
    });
    
    // Instead of setting a cookie here, we return the custom token
    // The client will sign in with it, get an ID token, and then call /api/session
    return NextResponse.json({ success: true, token: customToken });

  } catch (error: any) {
    console.error('PIN Login API error:', error);
    return NextResponse.json({ success: false, message: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
