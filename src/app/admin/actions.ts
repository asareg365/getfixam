'use server';

import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { logAuditEvent } from '@/lib/audit-log';

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
    const providerSnap = await providerRef.get();

    if (!providerSnap.exists) {
      return { success: false, error: 'Provider not found.' };
    }
    const previousStatus = providerSnap.data()?.status ?? 'unknown';

    await providerRef.update({
      status: 'approved',
      verified: true,
      approvedAt: FieldValue.serverTimestamp(),
    });

    await logAuditEvent({
      action: 'APPROVE_PROVIDER',
      entityType: 'provider',
      entityId: providerId,
      performedBy: admin.email,
      performedByUid: admin.uid,
      metadata: { previousStatus, newStatus: 'approved' },
    });

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
    const providerSnap = await providerRef.get();
     if (!providerSnap.exists) {
      return { success: false, error: 'Provider not found.' };
    }
    const previousStatus = providerSnap.data()?.status ?? 'unknown';

    await providerRef.update({
      status: 'rejected',
    });

     await logAuditEvent({
      action: 'REJECT_PROVIDER',
      entityType: 'provider',
      entityId: providerId,
      performedBy: admin.email,
      performedByUid: admin.uid,
      metadata: { previousStatus, newStatus: 'rejected' },
    });

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
        const providerSnap = await providerRef.get();
        if (!providerSnap.exists) {
            return { success: false, error: 'Provider not found.' };
        }
        const previousStatus = providerSnap.data()?.status ?? 'unknown';

        await providerRef.update({
            status: 'suspended',
        });

        await logAuditEvent({
            action: 'SUSPEND_PROVIDER',
            entityType: 'provider',
            entityId: providerId,
            performedBy: admin.email,
            performedByUid: admin.uid,
            metadata: { previousStatus, newStatus: 'suspended' },
        });

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
    const providerSnap = await providerRef.get();
    if (!providerSnap.exists) {
        return { success: false, error: 'Provider not found.' };
    }
    const previousData = providerSnap.data();

    const dataToUpdate: { isFeatured: boolean; featuredUntil: Date | FieldValue | null } = {
      isFeatured,
      featuredUntil: isFeatured && featuredUntil ? new Date(featuredUntil) : FieldValue.delete(),
    };
    
    await providerRef.update(dataToUpdate);

    await logAuditEvent({
        action: 'UPDATE_FEATURE_STATUS',
        entityType: 'provider',
        entityId: providerId,
        performedBy: admin.email,
        performedByUid: admin.uid,
        metadata: { 
            previous: { isFeatured: previousData?.isFeatured, featuredUntil: previousData?.featuredUntil?.toDate()?.toISOString() },
            new: { isFeatured: dataToUpdate.isFeatured, featuredUntil: featuredUntil },
        },
    });

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

        const newServiceRef = await adminDb.collection('services').add(serviceData);

        await logAuditEvent({
            action: 'CREATE_SERVICE',
            entityType: 'service',
            entityId: newServiceRef.id,
            performedBy: admin.email,
            performedByUid: admin.uid,
            metadata: { name, slug, basePrice },
        });

        revalidatePath('/admin/services');
        return { success: true, message: 'Service added successfully.' };
    } catch (error: any) {
        console.error('Error adding service:', error);
        return { success: false, message: error.message || 'Failed to add service.' };
    }
}
