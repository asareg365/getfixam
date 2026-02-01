'use server';

import { redirect } from 'next/navigation';

export async function searchAction(formData: FormData) {
  const query = (formData.get('query') as string)?.trim();

  if (!query) {
    redirect('/');
    return;
  }

  redirect(`/search?q=${encodeURIComponent(query)}`);
}
