'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function getAppearanceSettings() {
  try {
    const adminDb = getAdminDb();
    const settingsRef = adminDb.collection('system_settings').doc('appearance');
    const settingsSnap = await settingsRef.get();
    if (settingsSnap.exists) {
      const data = settingsSnap.data();
      return {
        siteName: data?.siteName || 'GetFixam Ghana',
        primaryColor: data?.primaryColor || '#dc2626', // Default primary color
        darkModeEnabled: data?.darkModeEnabled || false,
      };
    }
    return {
      siteName: 'GetFixam Ghana',
      primaryColor: '#dc2626',
      darkModeEnabled: false,
    };
  } catch (error) {
    console.error('Error fetching appearance settings:', error);
    return {
        siteName: 'GetFixam Ghana',
        primaryColor: '#dc2626',
        darkModeEnabled: false,
    };
  }
}

export async function updateAppearanceSettings(settings: { 
    siteName: string; 
    primaryColor: string; 
    darkModeEnabled: boolean; 
}) {
    try {
        const adminDb = getAdminDb();
        const settingsRef = adminDb.collection('system_settings').doc('appearance');
        await settingsRef.set(settings, { merge: true });
        revalidatePath('/admin/settings/appearance');
    } catch (error) {
        console.error('Error updating appearance settings:', error);
        throw new Error('Failed to update settings');
    }
}