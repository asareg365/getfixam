'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function getSecuritySettings(): Promise<{ providerLoginsDisabled?: boolean }> {
  try {
    const settingsRef = adminDb.collection('system_settings').doc('admin');
    const settingsSnap = await settingsRef.get();
    if (settingsSnap.exists) {
      return settingsSnap.data() as { providerLoginsDisabled?: boolean };
    }
    return {};
  } catch (error) {
    console.error('Error fetching security settings:', error);
    return {};
  }
}

export async function updateSecuritySettings(settings: { providerLoginsDisabled: boolean }): Promise<void> {
    try {
        const settingsRef = adminDb.collection('system_settings').doc('admin');
        await settingsRef.set(settings, { merge: true });
        revalidatePath('/admin/settings/security');
    } catch (error) {
        console.error('Error updating security settings:', error);
        throw new Error('Failed to update settings');
    }
}
