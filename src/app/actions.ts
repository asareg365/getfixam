'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addProvider as dbAddProvider, addReview as dbAddReview } from '@/lib/services';
import { PROVIDERS } from './lib/data';

const reviewSchema = z.object({
  providerId: z.string(),
  userName: z.string().min(2, 'Name must be at least 2 characters.'),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters.'),
});

export async function addReviewAction(prevState: any, formData: FormData) {
  const validatedFields = reviewSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // TODO: Replace with actual user image logic
  const randomUserImageId = `user${Math.floor(Math.random() * 6) + 1}`;

  try {
    await dbAddReview({ ...validatedFields.data, userImageId: randomUserImageId });
    revalidatePath(`/providers/${validatedFields.data.providerId}`);
    return { success: true, message: 'Thank you! Your review has been submitted.' };
  } catch (error) {
    console.error('Error adding review:', error);
    return { success: false, message: 'Failed to submit review. Please try again.' };
  }
}

const providerSchema = z.object({
  name: z.string().min(3, 'Business name is required.'),
  category: z.string().min(1, 'Please select a category.'),
  phone: z.string().regex(/^0[0-9]{9}$/, 'Enter a valid 10-digit phone number.'),
  whatsapp: z.string().regex(/^0[0-9]{9}$/, 'Enter a valid 10-digit phone number.'),
  zone: z.string().min(1, 'Please select a zone.'),
});

export async function addProviderAction(prevState: any, formData: FormData) {
    const validatedFields = providerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    // TODO: Replace with actual image upload logic
    const randomProviderImageId = `provider${Math.floor(Math.random() * 12) + 1}`;

    try {
        const { name, category, phone, whatsapp, zone } = validatedFields.data;
        
        await dbAddProvider({
            name,
            category,
            phone,
            whatsapp,
            location: {
                region: 'Bono',
                city: 'Berekum',
                zone: zone,
            },
            verified: false,
            status: 'pending',
            imageId: randomProviderImageId,
        });

        revalidatePath('/');
        revalidatePath(`/category/${validatedFields.data.category.toLowerCase()}`);
        return { success: true, message: 'Your business has been submitted for review!' };
    } catch (error) {
        console.error('Error adding provider:', error);
        return { success: false, message: 'Failed to submit your business. Please try again.' };
    }
}
