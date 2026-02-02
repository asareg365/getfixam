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
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error("Firebase env vars not available at runtime");
  }

  const validatedFields = providerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
      message: 'Please correct the errors below.'
    };
  }
  
  const { name, serviceId, phone, whatsapp, zone, digitalAddress } = validatedFields.data;

  try {
    // Check if provider with this phone number already exists
    const existingProviderSnap = await adminDb.collection('providers').where('phone', '==', phone).limit(1).get();
    if (!existingProviderSnap.empty) {
        return { success: false, message: 'A provider with this phone number already exists.' };
    }

    const categories = await getCategories();
    const category = categories.find(cat => cat.id === serviceId);

    if (!category) {
      return { success: false, message: 'Invalid service category selected.' };
    }

    const newProvider = {
      name,
      serviceId,
      phone,
      whatsapp,
      digitalAddress,
      location: {
        region: 'Bono', // Hardcoded for now
        city: 'Berekum', // Hardcoded for now
        zone,
      },
      status: 'pending',
      verified: false,
      isFeatured: false,
      rating: 0,
      reviewCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection('providers').add(newProvider);
    
    revalidatePath('/admin/providers');
    revalidatePath('/');
    
    return { success: true, message: 'Your business has been submitted for review! Our team will contact you shortly.' };

  } catch (error: any) {
    console.error('Error adding provider:', error);
    return { success: false, message: error.message || 'Failed to submit business. Please try again.' };
  }
}