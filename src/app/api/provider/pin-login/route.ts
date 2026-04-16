
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

/**
 * Validates Artisan PIN and manages Auth account lifecycle.
 * If no Auth account exists for an approved artisan, it creates one.
 */
export async function POST(req: Request) {
  try {
    const { phone, pin } = await req.json();

    if (!phone || !pin) {
      return NextResponse.json(
        { error: 'Phone and PIN are required.' },
        { status: 400 }
      );
    }

    // 1. Try multiple phone formats to find the Firestore document
    const formats = [
      phone, 
      phone.startsWith('0') ? '+233' + phone.substring(1) : phone,
      phone.startsWith('+233') ? '0' + phone.substring(4) : phone,
    ];
    const uniqueFormats = [...new Set(formats)];

    let providerDoc = null;
    for (const fmt of uniqueFormats) {
        const snapshot = await adminDb
          .collection('providers')
          .where('phone', '==', fmt)
          .limit(1)
          .get();
        if (!snapshot.empty) {
            providerDoc = snapshot.docs[0];
            break;
        }
    }

    if (!providerDoc) {
      return NextResponse.json(
        { error: 'No artisan account found for this phone number.' },
        { status: 401 }
      );
    }

    const providerData = providerDoc.data();

    // 2. Validate PIN
    if (providerData.loginPin !== pin) {
      return NextResponse.json(
        { error: 'Invalid PIN. Please check and try again.' },
        { status: 401 }
      );
    }
    
    // 3. Check status
    if (providerData.status !== 'approved') {
        const statusMsg = providerData.status === 'pending' 
            ? 'Your account is still pending admin approval.' 
            : `Your account is currently ${providerData.status}.`;
        return NextResponse.json({ error: statusMsg }, { status: 403 });
    }

    // 4. Ensure Auth user exists and has the correct role
    let targetUid = providerData.authUid || providerData.uid;

    if (!targetUid) {
        try {
            const authPhone = providerData.phone.startsWith('0') 
                ? '+233' + providerData.phone.substring(1) 
                : providerData.phone;
            
            let userRecord;
            try {
                userRecord = await adminAuth.getUserByPhoneNumber(authPhone);
            } catch (e) {
                // Create user if not found in Firebase Auth
                userRecord = await adminAuth.createUser({
                    phoneNumber: authPhone,
                    displayName: providerData.name,
                });
            }
            targetUid = userRecord.uid;
            
            // Link the UID to the Firestore document for future logins
            await providerDoc.ref.update({ authUid: targetUid });
        } catch (authError: any) {
            console.error("Auth Sync Error:", authError);
            return NextResponse.json({ error: "System failed to sync your auth account. Please contact support." }, { status: 500 });
        }
    }

    // 5. Set custom claims and generate custom token
    await adminAuth.setCustomUserClaims(targetUid, { role: 'provider' });
    const customToken = await adminAuth.createCustomToken(targetUid, { role: 'provider' });

    return NextResponse.json({ token: customToken });

  } catch (error: any) {
    console.error('Provider PIN login API error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected internal server error occurred.' },
      { status: 500 }
    );
  }
}
