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


/** ----- AUTH ACTIONS ----- */
export async function createAdminSession(idToken: string) {
  const decoded = await adminAuth.verifyIdToken(idToken);
    
  // This check now aligns with the security guard, using a hardcoded email.
  // This bypasses the need for a pre-existing document in the 'admins' Firestore collection.
  if (decoded.email?.toLowerCase() !== 'asareg365@gmail.com') {
    return { success: false, error: 'You are not authorized to access the admin panel.' };
  }

  cookies().set('adminSession', idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return { success: true };
}

export async function logoutAction() {
  cookies().delete('adminSession');
  redirect('/admin/login');
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
