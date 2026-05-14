import { redirect } from 'next/navigation';

/**
 * Legacy Category Redirect
 * Redirects to the Berekum tenant by default to maintain SEO and old bookmarks.
 */
export default async function CategoryRedirect(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    redirect(`/berekum/category/${params.slug}`);
}
