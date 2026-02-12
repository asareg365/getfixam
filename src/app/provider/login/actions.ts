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
      // Ignore settings check failures during prototyping if the collection doesn't exist
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

    // 4. Verify PIN (Support both legacy plain-text 'loginPin' and new hashed 'loginPinHash')
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

    // 5. Generate Custom Token
    let customToken: string;
    try {
      // This is where the "payload must be of type object" error happens if keys are missing
      customToken = await adminAuth.createCustomToken(providerId);
    } catch (tokenErr: any) {
      // Trap the specific crypto/signing error to prevent red-screen crashes
      if (tokenErr.message?.toLowerCase().includes('payload') || tokenErr.message?.toLowerCase().includes('object')) {
          return { error: 'Authentication Error: The server is missing valid security keys to sign your session. Please contact GetFixam support.' };
      }
      return { error: 'The server failed to create a secure session. Please try again.' };
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
        // Silent fail for logging
    }

    return { success: true, token: customToken };

  } catch (error: any) {
    // Prevent overlay for crypto errors that reach here
    if (error.message?.toLowerCase().includes('payload')) {
        return { error: 'Security Error: Invalid server configuration. Session could not be signed.' };
    }
    
    console.error('[Artisan Login] Error:', error.message || error);
    return { error: 'An unexpected error occurred. Please contact support.' };
  }
}
