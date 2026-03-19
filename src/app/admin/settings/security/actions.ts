'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function getSecuritySettings() {
  try {
    const settingsRef = adminDb.collection('system_settings').doc('admin');
    const settingsSnap = await settingsRef.get();
    if (settingsSnap.exists) {
      const data = settingsSnap.data();
      return {
        adminLocked: data?.adminLocked || false,
        providerLoginsDisabled: data?.providerLoginsDisabled || false,
        reason: data?.reason || '',
        updatedBy: data?.updatedBy || 'System',
        updatedAt: data?.updatedAt?.toDate?.()?.toLocaleString() || new Date().toLocaleString(),
      };
    }
    return {
        adminLocked: false,
        providerLoginsDisabled: false,
        reason: '',
        updatedBy: 'System',
        updatedAt: new Date().toLocaleString(),
    };
  } catch (error) {
    console.error('Error fetching security settings:', error);
    return {
        adminLocked: false,
        providerLoginsDisabled: false,
        reason: '',
        updatedBy: 'System',
        updatedAt: new Date().toLocaleString(),
    };
  }
}

export async function updateSecuritySettings(settings: { 
    adminLocked: boolean; 
    providerLoginsDisabled: boolean; 
    reason: string;
}) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('__session')?.value;
        if (!session) throw new Error('Unauthorized');
        
        const payload = await verifyToken(session);
        if (!payload || payload.portal !== 'admin') {
            throw new Error('Unauthorized');
        }

        const settingsRef = adminDb.collection('system_settings').doc('admin');
        await settingsRef.set({
            ...settings,
            updatedBy: payload.email || 'Admin',
            updatedAt: new Date(), 
        }, { merge: true });
        
        revalidatePath('/admin/settings/security');
    } catch (error) {
        console.error('Error updating security settings:', error);
        throw new Error('Failed to update settings');
    }
}