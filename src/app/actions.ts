'use server';

import { getCategories, getProviders } from '@/lib/services';
import { redirect } from 'next/navigation';

export async function searchAction(formData: FormData) {
  const query = (formData.get('query') as string)?.trim().toLowerCase();
  if (!query) {
    redirect('/category/all');
    return;
  }

  const categories = await getCategories();
  const normalizedQuery = query.replace(/\s+/g, '-');

  const foundCategory = categories.find((cat) =>
    cat.name.toLowerCase().includes(query) ||
    cat.slug.includes(normalizedQuery)
  );

  if (foundCategory) {
    redirect(`/category/${foundCategory.slug}`);
    return;
  }

  // If no category, search providers by name or service category
  const providers = await getProviders();
  const foundProvider = providers.find((p) =>
    p.name.toLowerCase().includes(query) ||
    (p.category && p.category.toLowerCase() !== 'n/a' && p.category.toLowerCase().includes(query))
  );

  if (foundProvider) {
    redirect(`/providers/${foundProvider.id}`);
    return;
  }

  // Default fallback
  redirect(`/category/all?search=${encodeURIComponent(query)}`);
}
