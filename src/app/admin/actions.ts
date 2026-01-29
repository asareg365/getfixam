'use server';

import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

export async function createAdminSession(idToken: string) {
  console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  console.log('GCP_PROJECT:', process.env.GOOGLE_CLOUD_PROJECT);

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    console.log('TOKEN VERIFIED FOR:', decoded.email);

    if (decoded.email?.toLowerCase() !== 'asareg365@gmail.com') {
      return { success: false };
    }

    cookies().set('adminSession', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('VERIFY TOKEN ERROR:', error);
    throw error;
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
