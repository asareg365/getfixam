import { getCategoryBySlug, getProviders } from '@/lib/services';
import ProviderCard from '@/components/ProviderCard';
import { notFound } from 'next/navigation';
import type { Provider } from '@/lib/types';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  const { CATEGORIES } = await import('@/lib/data');
  const slugs = CATEGORIES.map((category) => ({ slug: category.slug }));
  slugs.push({ slug: 'all' });
  return slugs;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) {
    return { title: 'Category Not Found' };
  }
  return {
    title: `${category.name} | FixAm Ghana`,
    description: `Find trusted ${category.name.toLowerCase()} in Berekum.`,
  };
}


export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    notFound();
  }

  const providers: Provider[] = await getProviders(params.slug);

  return (
    <div className="bg-secondary/20 min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="mb-12">
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary transition-colors flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
              <span className="mx-2">/</span>
              <span>{category.name}</span>
            </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{category.name}</h1>
          <p className="mt-2 text-lg text-foreground/80">
            {providers.length > 0
              ? `Browse through ${providers.length} ${category.name.toLowerCase()} available in Berekum.`
              : `No ${category.name.toLowerCase()} found in this category yet. Check back soon!`}
          </p>
        </div>

        {providers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <p className="text-xl font-semibold">Nothing to see here... yet!</p>
            <p className="text-muted-foreground mt-2">
              Be the first to list your business in this category.
            </p>
            <Button asChild className="mt-6">
              <Link href="/add-provider">List Your Business</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
