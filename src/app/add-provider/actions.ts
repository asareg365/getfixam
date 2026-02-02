'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getCategories } from '@/lib/services';

const providerSchema = z.object({
  name: z.string().min(3, 'Business name must be at least 3 characters.'),
  serviceId: z.string({ required_error: 'Please select a service category.' }).min(1, 'Please select a service category.'),
  phone: z.string().regex(/^0[0-9]{9}$/, 'A valid 10-digit phone number is required.'),
  whatsapp: z.string().regex(/^0[0-9]{9}$/, 'A valid 10-digit WhatsApp number is required.'),
  zone: z.string({ required_error: 'Please select a zone.' }).min(1, 'Please select a zone.'),
  digitalAddress: z.string().min(6, 'A valid digital address is required.'),
});

export async function addProviderAction(prevState: any, formData: FormData) {
    const validatedFields = providerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { name, serviceId, phone, whatsapp, zone, digitalAddress } = validatedFields.data;

    // Fetch categories to find the slug for the selected serviceId
    const categories = await getCategories();
    const category = categories.find(cat => cat.id === serviceId);
    const slug = category?.slug;

    // Map service slugs to relevant placeholder image IDs
    const serviceToImageMap: { [key: string]: string[] } = {
        'plumber': ['provider2', 'provider8'],
        'electrician': ['provider1', 'provider7'],
        'phone-repair': ['provider3', 'provider9'],
        'mechanic': ['provider4', 'provider10'],
        'carpenter': ['provider6', 'provider11'],
        'hairdresser': ['provider5', 'provider12'],
        'beautician': ['provider5'],
        'fashion-designer': ['provider5', 'provider12'],
        'tv-repair': ['provider1', 'provider7'],
        'metal-fabricator': ['provider4', 'provider6'],
        'masonry': ['provider6', 'provider11'],
        'tiller': ['provider6', 'provider11'],
        'aluminum-fabricator': ['provider4', 'provider6'],
    };

    const allProviderImageIds = [
        'provider1', 'provider2', 'provider3', 'provider4', 'provider5', 'provider6', 
        'provider7', 'provider8', 'provider9', 'provider10', 'provider11', 'provider12'
    ];

    let imageId;
    if (slug && serviceToImageMap[slug]) {
        const possibleImages = serviceToImageMap[slug];
        imageId = possibleImages[Math.floor(Math.random() * possibleImages.length)];
    } else {
        // Fallback for services without specific images or if slug not found
        imageId = allProviderImageIds[Math.floor(Math.random() * allProviderImageIds.length)];
    }

    try {
        await adminDb.collection('providers').add({
            name,
            serviceId,
            phone,
            whatsapp,
            location: {
                region: 'Bono',
                city: 'Berekum',
                zone: zone,
            },
            digitalAddress,
            imageId,
            status: "pending",
            verified: false,
            isFeatured: false,
            rating: 0,
            reviewCount: 0,
            createdAt: FieldValue.serverTimestamp()
        });


        revalidatePath('/');
        return { success: true, message: 'Your business has been submitted for review!' };
    } catch (error: any) {
        console.error('Error adding provider:', error);
        return { success: false, message: error.message || 'Failed to submit your business. Please try again.' };
    }
}
