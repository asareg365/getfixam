'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { logProviderAction } from '@/lib/audit-log';
import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';

/**
 * Verifies the artisan's PIN and returns a custom Firebase token if valid.
 * This function is hardened to prevent crashes from misconfigured signing keys.
 */
export async function loginWithPin(phone: string, pin: string): Promise<{ success: true; token: string } | { error: string }> {
  try {
    if (!phone || !/^0[0-9]{9}$/.test(phone)) {
      return { error: 'Enter a valid Ghanaian phone number starting with 0.' };
    }

    if (!pin || pin.length < 4) {
      return { error: 'Please enter a valid PIN.' };
    }

    // Check if the admin services are available
    if (!adminDb || !adminAuth) {
      console.error('[Artisan Login] Admin services are unavailable.');
      return { error: 'The authentication server is temporarily offline. Please try again later.' };
    }

    // 1. Check system-wide security settings (Lockouts)
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
      console.warn('[Artisan Login] System settings check skipped (not found).');
    }

    // 2. Find the provider by phone number
    const providersRef = adminDb.collection('providers');
    const query = providersRef.where('phone', '==', phone).limit(1);
    const snapshot = await query.get();

    if (snapshot.empty) {
      return { error: 'No account found with this phone number. Please list your business first.' };
    }

    const providerDoc = snapshot.docs[0];
    const providerData = providerDoc.data();
    const providerId = providerDoc.id;

    if (!providerId) {
        return { error: 'Invalid account data. Please contact support.' };
    }

    // 3. Verify account status
    if (providerData.status !== 'approved') {
      if (providerData.status === 'suspended') {
        return { error: 'Your account has been suspended. Please contact GetFixam support.' };
      }
      if (providerData.status === 'rejected') {
        return { error: 'Your business application was not approved.' };
      }
      return { error: 'Your account is still pending review. You will be notified via WhatsApp once approved.' };
    }

    // 4. Verify PIN (Support both legacy plain-text 'loginPin' and new 'loginPinHash')
    const pinHash = providerData.loginPinHash;
    const plainPin = providerData.loginPin;

    let isPinValid = false;

    if (pinHash && typeof pinHash === 'string') {
      isPinValid = await bcrypt.compare(pin, pinHash);
    } else if (plainPin && typeof plainPin === 'string') {
      isPinValid = plainPin === pin;
    } else {
      return { error: 'No login PIN is set for your account. Please contact GetFixam Admin for a reset.' };
    }

    if (!isPinValid) {
      return { error: 'The PIN you entered is incorrect.' };
    }

    // 5. Generate Custom Token
    let customToken: string;
    try {
      // CRITICAL: createCustomToken can throw "payload must be of type object" if signing keys are missing.
      customToken = await adminAuth.createCustomToken(providerId);
    } catch (tokenErr: any) {
      console.error('[Artisan Login] Token Generation Error:', tokenErr);
      
      // Specifically catch the "payload" signing error which indicates missing private keys in the Admin SDK
      if (tokenErr.message?.toLowerCase().includes('payload') || tokenErr.message?.toLowerCase().includes('object')) {
          return { error: 'Security configuration error: The server lacks the required keys to sign your session. Please contact support.' };
      }
      return { error: 'The authentication server failed to generate your session. Please try again.' };
    }

    // 6. Log Success (Non-blocking)
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
        console.warn('[Artisan Login] Success log failed, but continuing login.');
    }

    return { success: true, token: customToken };

  } catch (error: any) {
    console.error('[Artisan Login] Critical Error:', error);
    
    // Final safety check for the payload error in the outer catch block
    if (error.message?.toLowerCase().includes('payload')) {
        return { error: 'Security error: Invalid authentication keys. Please contact GetFixam Admin.' };
    }
    
    return { error: 'An unexpected error occurred during login. Please contact support.' };
  }
}
