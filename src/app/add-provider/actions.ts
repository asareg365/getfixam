'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getCategories } from '@/lib/data';

const providerSchema = z.object({
  name: z.string().min(3, 'Business name must be at least 3 characters.'),
  serviceId: z.string({ required_error: 'Please select a service category.' }).min(1, 'Please select a service category.'),
  phone: z.string().regex(/^0[0-9]{9}$/, 'A valid 10-digit phone number is required.'),
  whatsapp: z.string().regex(/^0[0-9]{9}$/, 'A valid 10-digit WhatsApp number is required.'),
  zone: z.string({ required_error: 'Please select a zone.' }).min(1, 'Please select a zone.'),
  digitalAddress: z.string().min(6, 'A valid digital address is required.'),
});

export async function addProviderAction(prevState: any, formData: FormData) {
    try {
        await adminDb.collection('test').add({ ok: true });
        return { success: true, message: 'Firestore test write was successful! The credentials seem to be working.' };
    } catch (error: any) {
        console.error('Firestore test write FAILED:', error);
        return { success: false, message: `Firestore test write failed: ${error.message}` };
    }
}
