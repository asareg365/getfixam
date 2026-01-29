
'use server';

import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

export async function createAdminSession(idToken: string) {
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Make the check case-insensitive to avoid login issues due to capitalization.
    if (decoded.email?.toLowerCase() !== 'asareg365@gmail.com') {
      console.warn(`Unauthorized login attempt from: ${decoded.email}`);
      return { success: false, error: 'Unauthorized' };
    }

    cookies().set('adminSession', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Session creation failed:', error);
    return { success: false, error: 'Session creation failed' };
  }
}

export async function logoutAction() {
  cookies().delete('adminSession');
  revalidatePath('/admin/login');
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
