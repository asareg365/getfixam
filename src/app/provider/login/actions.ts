'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { logProviderAction } from '@/lib/audit-log';
import { headers } from 'next/headers';

/**
 * Verifies the artisan's PIN and returns a custom Firebase token if valid.
 */
export async function loginWithPin(phone: string, pin: string): Promise<{ success: true; token: string } | { error: string }> {
  try {
    if (!/^0[0-9]{9}$/.test(phone)) {
      return { error: 'Enter a valid Ghanaian phone number starting with 0.' };
    }

    // Check if the admin services are available
    if (!adminDb || !adminAuth) {
      console.error('[Artisan Login] Admin services are null.');
      return { error: 'The authentication server is temporarily unavailable. Please try again in a few minutes.' };
    }

    // 1. Check system-wide security settings (Lockouts)
    try {
      const settingsRef = adminDb.collection('system_settings').doc('admin');
      const settingsSnap = await settingsRef.get();
      
      if (settingsSnap.exists) {
        const settings = settingsSnap.data();
        if (settings?.adminLocked === true) {
          return { error: 'The system is currently locked for maintenance. Please try again later.' };
        }
        if (settings?.providerLoginsDisabled === true) {
          return { error: 'Artisan logins are temporarily disabled by an administrator.' };
        }
      }
    } catch (e) {
      // If settings don't exist yet, we continue (graceful degradation)
      console.warn('[Artisan Login] Could not verify system settings, proceeding anyway.');
    }

    // 2. Find the provider by phone number
    const providersRef = adminDb.collection('providers');
    const query = providersRef.where('phone', '==', phone).limit(1);
    const snapshot = await query.get();

    if (snapshot.empty) {
      return { error: 'No account found with this phone number. Please register your business first.' };
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

    // 4. Verify PIN
    if (!providerData.loginPin) {
      return { error: 'A login PIN has not been set for your account. Please contact GetFixam Admin.' };
    }

    if (providerData.loginPin !== pin) {
      return { error: 'The PIN you entered is incorrect.' };
    }

    // 5. Generate Custom Token
    const customToken = await adminAuth.createCustomToken(providerId);

    // 6. Log Success
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    await logProviderAction({
      providerId: providerId,
      action: 'PROVIDER_LOGIN_PIN_SUCCESS',
      ipAddress,
      userAgent,
    });

    return { success: true, token: customToken };

  } catch (error: any) {
    console.error('[Artisan Login] Critical Error:', error);
    return { error: 'An unexpected error occurred. Please contact support if this persists.' };
  }
}
