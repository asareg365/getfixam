'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { logProviderAction } from '@/lib/audit-log';
import { headers } from 'next/headers';

export async function loginWithPin(phone: string, pin: string): Promise<{ success: true } | { error: string }> {
  try {
    if (!/^0[0-9]{9}$/.test(phone)) {
      return { error: 'Enter a valid Ghanaian phone number starting with 0.' };
    }
    
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    const snap = await adminDb
      .collection('providers')
      .where('phone', '==', phone)
      .limit(1)
      .get();

    if (snap.empty) {
      return { error: 'No provider account found for this phone number.' };
    }

    const doc = snap.docs[0];
    const provider = doc.data();

    if (provider.status !== 'approved') {
      return { error: `Your account is currently ${provider.status} and cannot be accessed.` };
    }

    if (!provider.loginPinHash) {
      // This could be because they already used the PIN and are now using Firebase Auth,
      // or an admin hasn't issued one.
      return { error: 'PIN login is not available for this account. Please contact an admin if you believe this is an error.' };
    }

    const pinValid = await bcrypt.compare(pin, provider.loginPinHash);

    if (!pinValid) {
      await logProviderAction({ providerId: doc.id, action: 'PROVIDER_LOGIN_FAILED_PIN', ipAddress, userAgent });
      return { error: 'The PIN you entered is incorrect.' };
    }

    // PIN is valid. Now we create a Firebase Auth user if one doesn't exist,
    // then create a session cookie.

    const formattedPhone = `+233${phone.substring(1)}`;
    let user;

    try {
      user = await adminAuth.getUserByPhoneNumber(formattedPhone);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        user = await adminAuth.createUser({ phoneNumber: formattedPhone, displayName: provider.name });
      } else {
        throw error; // Re-throw to be caught by the outer catch block
      }
    }

    // Link the auth UID to the provider profile if it's not already there.
    if (provider.authUid !== user.uid) {
        await doc.ref.update({ authUid: user.uid });
    }

    // Nullify the PIN so it can't be used again.
    await doc.ref.update({
      loginPinHash: null,
      loginPinCreatedAt: null,
    });
    
    await logProviderAction({ providerId: doc.id, action: 'PROVIDER_LOGIN_SUCCESS_PIN', ipAddress, userAgent });
    
    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const idToken = await adminAuth.createCustomToken(user.uid);
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });


    cookies().set('__session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: expiresIn,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Provider PIN Login Action Error:', error);
    return { error: 'An unexpected server error occurred. Please try again.' };
  }
}
