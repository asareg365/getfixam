'use server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createSession, deleteSession as deleteCookieSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

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

export async function approveProvider(prevState: any, formData: FormData) {
  const providerId = formData.get('providerId') as string;
  if (!providerId) return { success: false, error: 'Provider ID is missing.' };

  try {
    await adminDb.collection('providers').doc(providerId).update({
      status: 'approved',
      verified: true,
      approvedAt: FieldValue.serverTimestamp(),
    });
    revalidatePath('/admin/providers');
    revalidatePath('/');
    return { success: true, message: 'Provider approved.' };
  } catch (error) {
    console.error('Error approving provider:', error);
    return { success: false, error: 'Failed to approve provider.' };
  }
}

export async function rejectProvider(prevState: any, formData: FormData) {
  const providerId = formData.get('providerId') as string;
  if (!providerId) return { success: false, error: 'Provider ID is missing.' };

  try {
    await adminDb.collection('providers').doc(providerId).update({
      status: 'rejected',
      verified: false,
    });
    revalidatePath('/admin/providers');
    return { success: true, message: 'Provider rejected.' };
  } catch (error) {
    console.error('Error rejecting provider:', error);
    return { success: false, error: 'Failed to reject provider.' };
  }
}
