'use server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createSession, deleteSession as deleteCookieSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createAdminSession(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const adminDoc = await adminDb.collection('admins').doc(uid).get();
    if (!adminDoc.exists) {
        return { success: false, error: 'Access denied. You are not an administrator.' };
    }

    await createSession(uid);
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Session creation failed:', error);
    return { success: false, error: 'Authentication failed. Please try again.' };
  }
}


export async function logoutAction() {
    deleteCookieSession();
}
