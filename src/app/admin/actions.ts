'use server';

import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { redirect } from 'next/navigation';

export async function createAdminSession(idToken: string) {
  console.log('Running as service account');
  console.log('GCLOUD PROJECT:', process.env.GCLOUD_PROJECT);
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
  redirect('/admin/login');
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

const serviceSchema = z.object({
  name: z.string().min(3, 'Service name must be at least 3 characters.'),
  icon: z.string().min(1, 'Please select an icon.'),
  basePrice: z.coerce.number().min(0, 'Base price cannot be negative.'),
  maxSurge: z.coerce.number().min(1, 'Max surge must be at least 1.'),
  minSurge: z.coerce.number().min(1, 'Min surge must be at least 1.'),
  active: z.preprocess((val) => val === 'on', z.boolean()),
});

export async function addServiceAction(prevState: any, formData: FormData) {
  const validatedFields = serviceSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { name, icon, basePrice, maxSurge, minSurge, active } = validatedFields.data;
  
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  try {
    const existingService = await adminDb.collection('services').where('slug', '==', slug).get();
    if (!existingService.empty) {
        return { success: false, message: 'A service with this name already exists.' };
    }

    await adminDb.collection('services').add({
      name,
      slug,
      icon,
      basePrice,
      maxSurge,
      minSurge,
      active,
      currency: 'GHS',
    });

    revalidatePath('/admin/services');
    return { success: true, message: 'Service added successfully.' };
  } catch (error) {
    console.error('Error adding service:', error);
    return { success: false, message: 'Failed to add service.' };
  }
}
