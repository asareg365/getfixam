'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { logProviderAction } from '@/lib/audit-log';
import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';

/**
 * Verifies the artisan's PIN and returns a custom Firebase token if valid.
 */
export async function loginWithPin(phone: string, pin: string): Promise<{ success: true; token: string } | { error: string }> {
  try {
    if (!phone || !/^0[0-9]{9}$/.test(phone)) {
      return { error: 'Enter a valid Ghanaian phone number starting with 0.' };
    }

    if (!pin || pin.length < 4) {
      return { error: 'Please enter a valid PIN.' };
    }

    // 1. Check if the admin services are available
    if (!adminDb || !adminAuth) {
      return { error: 'The authentication server is temporarily offline. Please try again later.' };
    }

    // 2. Check system-wide security settings (Lockouts)
    try {
      const settingsRef = adminDb.collection('system_settings').doc('admin');
      const settingsSnap = await settingsRef.get();
      
      if (settingsSnap.exists) {
        const settings = settingsSnap.data();
        if (settings?.adminLocked === true) {
          return { error: 'The system is locked for maintenance. Please try again later.' };
        }
        if (settings?.providerLoginsDisabled === true) {
          return { error: 'Artisan logins are temporarily disabled by an administrator.' };
        }
      }
    } catch (e) {
      // Safe default for prototyping
    }

    // 3. Find the provider by phone number
    const providersRef = adminDb.collection('providers');
    const snapshot = await providersRef.where('phone', '==', phone).limit(1).get();

    if (snapshot.empty) {
      return { error: 'No account found with this phone number. Please list your business first.' };
    }

    const providerDoc = snapshot.docs[0];
    const providerData = providerDoc.data();
    const providerId = providerDoc.id;

    // 4. Verify account status
    if (providerData.status !== 'approved') {
      if (providerData.status === 'suspended') {
        return { error: 'Your account has been suspended. Please contact GetFixam support.' };
      }
      if (providerData.status === 'rejected') {
        return { error: 'Your business application was not approved.' };
      }
      return { error: 'Your account is still pending review. You will be notified via WhatsApp once approved.' };
    }

    // 5. Verify PIN (Support both legacy plain-text 'loginPin' and hashed 'loginPinHash')
    const pinHash = providerData.loginPinHash;
    const plainPin = providerData.loginPin;

    let isPinValid = false;
    if (pinHash && typeof pinHash === 'string') {
      isPinValid = await bcrypt.compare(pin, pinHash);
    } else if (plainPin && typeof plainPin === 'string') {
      isPinValid = plainPin === pin;
    } else {
      return { error: 'No login PIN is set for your account. Please contact an administrator.' };
    }

    if (!isPinValid) {
      return { error: 'The PIN you entered is incorrect.' };
    }

    // 6. Generate Custom Token
    let customToken: string;
    try {
      // We use the Firestore document ID as the unique UID for this session
      customToken = await adminAuth.createCustomToken(providerId);
    } catch (tokenErr: any) {
      return { error: 'Maintenance: The security server is temporarily unable to sign tokens.' };
    }

    // 7. Log Success
    try {
        const headersList = await headers();
        const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        await logProviderAction({
            providerId: providerId,
            action: 'PROVIDER_LOGIN_PIN_SUCCESS',
            ipAddress,
            userAgent,
        });
    } catch (logErr) {
        // Silent fail for logging
    }

    return { success: true, token: customToken };

  } catch (error: any) {
    if (error.message?.toLowerCase().includes('payload')) {
        return { error: 'Maintenance: Authentication service is temporarily unavailable.' };
    }
    return { error: 'An unexpected error occurred during login. Please contact support.' };
  }
}
