'use server';

import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { redirect } from 'next/navigation';

/** ----- Helper: Get Admin Context ----- */
async function getAdminContext() {
  const token = cookies().get('adminSession')?.value;
  if (!token) throw new Error('No admin session found. Please log in.');

  const decoded = await adminAuth.verifyIdToken(token);
  return {
    email: decoded.email ?? 'unknown',
    uid: decoded.uid,
  };
}

/** ----- Helper: Audit Logger ----- */
async function logAudit(adminEmail: string, providerId: string, providerName: string, action: 'approved' | 'rejected') {
  try {
    await adminDb.collection('auditLogs').add({
      adminEmail,
      providerId,
      providerName,
      action,
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
    // Non-blocking so we don't fail the main action
  }
}


/** ----- AUTH ACTIONS ----- */
export async function createAdminSession(idToken: string) {
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    
    const adminRef = await adminDb.collection('admins').doc(decoded.uid).get();
    if (!adminRef.exists) {
        return { success: false, error: 'You are not authorized as an admin.' };
    }

    cookies().set('adminSession', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating admin session:', error);
    return { success: false, error: 'Failed to verify admin token.' };
  }
}

export async function logoutAction() {
  cookies().delete('adminSession');
  redirect('/admin/login');
}


/** ----- PROVIDER ACTIONS ----- */
export async function approveProvider(prevState: any, formData: FormData) {
  const providerId = formData.get('providerId') as string;
  if (!providerId) return { success: false, error: 'Provider ID is missing.' };

  try {
    const admin = await getAdminContext();
    const providerRef = adminDb.collection('providers').doc(providerId);
    const snap = await providerRef.get();

    if (!snap.exists) {
      return { success: false, error: 'Provider not found.' };
    }
    const providerData = snap.data();
    if (!providerData) {
        return { success: false, error: 'Provider data is empty.' };
    }

    await providerRef.update({
      status: 'approved',
      verified: true,
      approvedAt: FieldValue.serverTimestamp(),
    });

    await logAudit(admin.email, providerId, providerData.name, 'approved');

    revalidatePath('/admin/providers');
    revalidatePath('/');
    return { success: true, message: 'Provider approved.' };
  } catch (error: any) {
    console.error('Error approving provider:', error);
    return { success: false, error: error.message || 'Failed to approve provider.' };
  }
}

export async function rejectProvider(prevState: any, formData: FormData) {
  const providerId = formData.get('providerId') as string;
  if (!providerId) return { success: false, error: 'Provider ID is missing.' };

  try {
    const admin = await getAdminContext();
    const providerRef = adminDb.collection('providers').doc(providerId);
    const snap = await providerRef.get();
     if (!snap.exists) {
      return { success: false, error: 'Provider not found.' };
    }
    const providerData = snap.data();
    if (!providerData) {
        return { success: false, error: 'Provider data is empty.' };
    }

    await providerRef.update({ status: 'rejected' });
    
    await logAudit(admin.email, providerId, providerData.name, 'rejected');

    revalidatePath('/admin/providers');
    return { success: true, message: 'Provider rejected.' };
  } catch (error: any) {
    console.error('Error rejecting provider:', error);
    return { success: false, error: error.message ||'Failed to reject provider.' };
  }
}

export async function suspendProvider(prevState: any, formData: FormData) {
    const providerId = formData.get('providerId') as string;
    if (!providerId) return { success: false, error: 'Provider ID is missing.' };

    try {
        const admin = await getAdminContext();
        const providerRef = adminDb.collection('providers').doc(providerId);
        const snap = await providerRef.get();
        if (!snap.exists) {
            return { success: false, error: 'Provider not found.' };
        }

        await providerRef.update({ status: 'suspended' });

        revalidatePath('/admin/providers');
        return { success: true, message: 'Provider suspended.' };
    } catch (error: any) {
        console.error('Error suspending provider:', error);
        return { success: false, error: error.message || 'Failed to suspend provider.' };
    }
}


export async function updateFeatureStatus(prevState: any, formData: FormData) {
  const providerId = formData.get('providerId') as string;
  const isFeatured = formData.get('isFeatured') === 'on';
  const featuredUntil = formData.get('featuredUntil') as string | null;

  if (!providerId) return { success: false, error: 'Provider ID is missing.' };

  try {
    const admin = await getAdminContext();
    const providerRef = adminDb.collection('providers').doc(providerId);
    const snap = await providerRef.get();
    if (!snap.exists) {
        return { success: false, error: 'Provider not found.' };
    }

    const update: { isFeatured: boolean; featuredUntil?: Date | FieldValue } = {
      isFeatured,
    };

    if (isFeatured && featuredUntil) {
      update.featuredUntil = new Date(featuredUntil);
    } else {
      update.featuredUntil = FieldValue.delete();
    }
    
    await providerRef.update(update);

    revalidatePath('/admin/providers');
    revalidatePath('/');
    return { success: true, message: 'Provider feature status updated.' };
  } catch (error: any) {
    console.error('Error updating feature status:', error);
    return { success: false, error: error.message || 'Failed to update provider status.' };
  }
}

/** ----- SERVICE ACTIONS ----- */
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
        return { success: false, errors: validatedFields.error.flatten().fieldErrors };
    }
  
    try {
        const admin = await getAdminContext();
        const { name, icon, basePrice, maxSurge, minSurge, active } = validatedFields.data;
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        const existingService = await adminDb.collection('services').where('slug', '==', slug).get();
        if (!existingService.empty) {
            return { success: false, message: 'A service with this name already exists.' };
        }

        const serviceData = {
            name, slug, icon, basePrice, maxSurge, minSurge, active, currency: 'GHS',
            createdAt: FieldValue.serverTimestamp(),
        };

        await adminDb.collection('services').add(serviceData);
        
        revalidatePath('/admin/services');
        return { success: true, message: 'Service added successfully.' };
    } catch (error: any) {
        console.error('Error adding service:', error);
        return { success: false, message: error.message || 'Failed to add service.' };
    }
}
