'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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

  if (!adminDb) {
    throw new Error('Admin DB is not initialized');
  }

  // TODO: Replace with actual user image logic
  const randomUserImageId = `user${Math.floor(Math.random() * 6) + 1}`;

  try {
    await adminDb.collection('reviews').add({
      ...validatedFields.data,
      userImageId: randomUserImageId,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp()
    });
    revalidatePath(`/providers/${validatedFields.data.providerId}`);
    return { success: true, message: 'Thank you! Your review has been submitted for moderation.' };
  } catch (error: any) {
    console.error('Error adding review:', error);
    return { success: false, message: error.message || 'Failed to submit review. Please try again.' };
  }
}
