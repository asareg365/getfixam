import { getCategoryBySlug, getProviders } from '@/lib/services';
import { getBerekumZones } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Provider } from '@/lib/types';
import Link from 'next/link';
import { Home } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import ProviderList from './ProviderList';

export const dynamic = "force-dynamic";

/*
export async function generateStaticParams() {
  const categories = await getCategories();
  const slugs = categories.map((category) => ({ slug: category.slug }));
  slugs.push({ slug: 'all' }); // Include "all" as a special category
  return slugs;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  if (params.slug === 'all') {
    return {
      title: `All Providers | FixAm Ghana`,
      description: `Browse all trusted service providers in Berekum.`,
    };
  }

  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: 'Category Not Found' };

  return {
    title: `${category.name} | FixAm Ghana`,
    description: `Find trusted ${category.name.toLowerCase()} in Berekum.`,
  };
}
*/

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  let categoryName = 'All Providers';
  let providers: Provider[] = [];
  const zones = await getBerekumZones();

  try {
    if (params.slug === 'all') {
      providers = await getProviders(); // Fetch all providers
    } else {
      const category = await getCategoryBySlug(params.slug);
      if (!category) notFound();
      categoryName = category.name;
      providers = await getProviders(params.slug);
    }
  } catch (err) {
    console.error('Error fetching providers or category:', err);
    providers = [];
  }

  return (
    <PublicLayout>
      <div className="bg-secondary/20 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          {/* Breadcrumb */}
          <div className="mb-12">
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary transition-colors flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
              <span className="mx-2">/</span>
              <span>{categoryName}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{categoryName}</h1>
            <p className="mt-2 text-lg text-foreground/80">
              Browse artisans and filter by location and verification status.
            </p>
          </div>

          <ProviderList initialProviders={providers} zones={zones} />

        </div>
      </div>
    </PublicLayout>
  );
}
