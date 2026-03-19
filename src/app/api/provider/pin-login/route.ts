import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { logProviderAction } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

/**
 * Handles Artisan (Provider) login using a phone number and 6-digit PIN.
 * This route verifies the PIN against Firestore and returns a Firebase Custom Token.
 */
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

    if (!adminDb || !adminAuth) {
        console.error('Firebase Admin not initialized.');
        return NextResponse.json({ success: false, error: 'Database not initialized' }, { status: 500 });
    }
    
    // 1. Find the provider document associated with the phone number
    const providersRef = adminDb.collection('providers');
    const q = providersRef.where('phone', '==', rawPhone).limit(1);
    const providerSnap = await q.get();

    if (providerSnap.empty) {
        return NextResponse.json({ success: false, message: 'Account not found for this phone number.' }, { status: 404 });
    }

    const providerDoc = providerSnap.docs[0];
    const providerData = providerDoc.data();
    
    // 2. Status verification
    if (providerData.status !== 'approved') {
        return NextResponse.json({ success: false, message: `Your account is currently ${providerData.status}.` }, { status: 403 });
    }

    // 3. PIN eligibility check
    if (!providerData.loginPin) {
        return NextResponse.json({ 
            success: false, 
            message: 'This account is not configured for PIN login. Please contact an administrator to reset your PIN.' 
        }, { status: 403 });
    }

    // 4. Verify PIN
    const pinMatch = providerData.loginPin === pin;
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    if (!pinMatch) {
        await logProviderAction({ providerId: providerDoc.id, action: 'PROVIDER_LOGIN_FAILED_PIN', ipAddress, userAgent });
        return NextResponse.json({ success: false, message: 'The PIN you entered is incorrect.' }, { status: 401 });
    }
    
    // 5. Auth Integration: Get or create the Firebase Auth user
    const formattedPhone = formatPhoneNumber(rawPhone);
    let user;

    try {
        user = await adminAuth.getUserByPhoneNumber(formattedPhone);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            // Auto-provision Auth account if it doesn't exist yet
            user = await adminAuth.createUser({ phoneNumber: formattedPhone, displayName: providerData.name });
            // Ensure the user has the correct role claim
            await adminAuth.setCustomUserClaims(user.uid, { role: 'provider' });
        } else {
            throw error;
        }
    }

    // Link the Firestore document to the Auth UID for future queries
    if (providerData.authUid !== user.uid) {
        await providerDoc.ref.update({ authUid: user.uid });
    }
    
    // 6. Generate Custom Token
    const customToken = await adminAuth.createCustomToken(user.uid);

    // LOGIC FIX: We no longer nullify the PIN here. 
    // Artisans use their PIN as their primary dashboard access key.
    
    await logProviderAction({
        providerId: providerDoc.id,
        action: 'PROVIDER_LOGIN_SUCCESS_PIN',
        ipAddress,
        userAgent,
    });
    
    return NextResponse.json({ success: true, token: customToken });

  } catch (error: any) {
    console.error('PIN Login API error:', error);
    return NextResponse.json({ success: false, message: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
