'use server';

import { redirect } from 'next/navigation';

/**
 * Handles the landing page search submission.
 * Redirects to the /search page with the appropriate query parameters.
 */
export async function searchAction(formData: FormData) {
  const query = (formData.get('query') as string)?.trim();
  const location = (formData.get('location') as string)?.trim();

  if (!query && !location) {
    redirect('/category/all');
  }

  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (location) params.set('location', location);

  redirect(`/search?${params.toString()}`);
}
