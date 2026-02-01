'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addProvider as dbAddProvider, addReview as dbAddReview, getCategories, getProviders } from '@/lib/services';
import { redirect } from 'next/navigation';

export async function searchAction(formData: FormData) {
  const query = (formData.get('query') as string)?.trim().toLowerCase();
  if (!query) {
    redirect('/category/all');
    return;
  }

  const categories = await getCategories();
  const foundCategory = categories.find(
    (cat) =>
      cat.name.toLowerCase().includes(query) ||
      cat.slug === query.replace(/\s+/g, '-')
  );

  if (foundCategory) {
    redirect(`/category/${foundCategory.slug}`);
    return;
  }

  // If no category, search providers by name
  const providers = await getProviders();
  const foundProvider = providers.find((p) =>
    p.name.toLowerCase().includes(query)
  );

  if (foundProvider) {
    redirect(`/providers/${foundProvider.id}`);
    return;
  }

  // Default fallback
  redirect('/category/all');
}

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
  serviceId: z.string().min(1, 'Please select a category.'),
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
    
    const { name, serviceId, phone, whatsapp, zone } = validatedFields.data;

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
        'metal-fabrication': ['provider4', 'provider6'],
        'masonry': ['provider6', 'provider11'],
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
        await dbAddProvider({
            name,
            serviceId,
            phone,
            whatsapp,
            location: {
                region: 'Bono',
                city: 'Berekum',
                zone: zone,
            },
            verified: false,
            status: 'pending',
            imageId: imageId,
        });

        revalidatePath('/');
        return { success: true, message: 'Your business has been submitted for review!' };
    } catch (error) {
        console.error('Error adding provider:', error);
        return { success: false, message: 'Failed to submit your business. Please try again.' };
    }
}
