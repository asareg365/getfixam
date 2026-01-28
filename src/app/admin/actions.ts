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

export async function updateFeatureStatus(prevState: any, formData: FormData) {
  const providerId = formData.get('providerId') as string;
  const isFeatured = formData.get('isFeatured') === 'on';
  const featuredUntil = formData.get('featuredUntil') as string | null;

  if (!providerId) {
    return { success: false, error: 'Provider ID is missing.' };
  }

  try {
    const dataToUpdate: { isFeatured: boolean; featuredUntil: Date | null } = {
      isFeatured,
      featuredUntil: isFeatured && featuredUntil ? new Date(featuredUntil) : null,
    };
    
    await adminDb.collection('providers').doc(providerId).update(dataToUpdate);
    revalidatePath('/admin/providers');
    revalidatePath('/');
    return { success: true, message: 'Provider feature status updated successfully.' };
  } catch (error) {
    console.error('Error updating feature status:', error);
    return { success: false, error: 'Failed to update provider status.' };
  }
}
