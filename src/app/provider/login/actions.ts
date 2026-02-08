'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import bcrypt from 'bcrypt';
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

    if (!adminDb || !adminAuth) {
      console.error('Firebase Admin not initialized.');
      return { error: 'Authentication or Database service is not available.' };
    }

    // Check system-wide security settings
    const settingsRef = adminDb.collection('system_settings').doc('admin');
    const settingsSnap = await settingsRef.get();
    const settings = settingsSnap.data();

    if (settings?.adminLocked === true) {
      return { error: 'The system is currently locked for maintenance. Please try again later.' };
    }

    if (settings?.providerLoginsDisabled === true) {
      return { error: 'Provider logins are temporarily disabled by an administrator.' };
    }

    // Find the provider by phone number
    const providersRef = adminDb.collection('providers');
    const query = providersRef.where('phone', '==', phone).limit(1);
    const snapshot = await query.get();

    if (snapshot.empty) {
      return { error: 'No account found with this phone number.' };
    }

    const providerDoc = snapshot.docs[0];
    const providerData = providerDoc.data();
    const providerId = providerDoc.id;

    // Verify account status
    if (providerData.status !== 'approved') {
      if (providerData.status === 'suspended') {
        return { error: 'Your account has been suspended. Please contact support.' };
      }
      if (providerData.status === 'rejected') {
        return { error: 'Your account application was rejected.' };
      }
      return { error: 'Your account is not yet approved for login.' };
    }

    // Verify PIN exists
    if (!providerData.loginPinHash) {
      return { error: 'No PIN has been set for your account. Please contact support to get one.' };
    }

    // Compare PIN using bcrypt
    const isPinValid = await bcrypt.compare(pin, providerData.loginPinHash);

    if (!isPinValid) {
      return { error: 'The PIN you entered is incorrect. Please try again.' };
    }

    // Generate a custom Firebase token for the client-side sign-in
    const customToken = await adminAuth.createCustomToken(providerId);

    // Log the successful login attempt
    const ipAddress = (await headers()).get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = (await headers()).get('user-agent') || 'unknown';

    await logProviderAction({
      providerId: providerId,
      action: 'PROVIDER_LOGIN_PIN_SUCCESS',
      ipAddress,
      userAgent,
    });

    // We do NOT nullify the PIN here yet; we let the artisan use it until they reset it themselves
    // or until the admin resets it again.

    return { success: true, token: customToken };

  } catch (error: any) {
    console.error('Error during PIN login:', error);
    return { error: 'An unexpected server error occurred during login.' };
  }
}
