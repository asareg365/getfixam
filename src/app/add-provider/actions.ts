'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getCategories } from '@/lib/data';
import { geohashForLocation } from 'geofire-common';

const providerSchema = z.object({
  name: z.string().min(3, 'Business name must be at least 3 characters.'),
  serviceId: z.string({ required_error: 'Please select a service category.' }).min(1, 'Please select a service category.'),
  phone: z.string().regex(/^0[0-9]{9}$/, 'A valid 10-digit phone number is required.'),
  whatsapp: z.string().regex(/^0[0-9]{9}$/, 'A valid 10-digit WhatsApp number is required.'),
  digitalAddress: z.string().min(6, 'A valid digital address is required.'),
});

export async function addProviderAction(prevState: any, formData: FormData) {
  const validatedFields = providerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
      message: 'Please correct the errors below.'
    };
  }
  
  const { name, serviceId, phone, whatsapp, digitalAddress } = validatedFields.data;

  try {
    const existingProviderSnap = await adminDb.collection('providers').where('phone', '==', phone).limit(1).get();
    if (!existingProviderSnap.empty) {
        return { success: false, message: 'A provider with this phone number already exists.' };
    }

    const categories = await getCategories();
    const category = categories.find(cat => cat.id === serviceId || cat.slug === serviceId);

    if (!category) {
      return { success: false, message: 'Invalid service category selected.' };
    }
    
    // In a real app, you would get these from the user's location input
    const lat = 0.0;
    const lng = 0.0;
    const geohash = geohashForLocation([lat, lng]);

    const newProvider = {
      name,
      serviceId,
      phone,
      whatsapp,
      digitalAddress,
      geo: { // New nested object for coordinates
        lat,
        lng,
      },
      geohash, // Top-level geohash for fast querying
      isOnline: false,
      isAvailable: false, // Provider is offline by default
      status: 'pending',
      verified: false,
      isFeatured: false,
      rating: 0,
      reviewCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection('providers').add(newProvider);
    
    revalidatePath('/admin/providers');
    revalidatePath('/category/all');
    revalidatePath('/');
    
    return { success: true, message: 'Your business has been submitted for review! It will appear in the directory shortly.' };

  } catch (error: any) {
    console.error('Error adding provider:', error);
    return { success: false, message: error.message || 'Failed to submit business. Please try again.' };
  }
}
