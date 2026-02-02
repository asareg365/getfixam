import { getCategories } from '@/lib/data';
import { getProviders } from '@/lib/services';
import PublicLayout from '@/components/layout/PublicLayout';
import CategoryCard from '@/components/CategoryCard';
import ProviderCard from '@/components/ProviderCard';
import type { Category, Provider } from '@/lib/types';

type SearchPageProps = {
  searchParams: { q?: string };
};

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = (searchParams.q || '').toLowerCase().trim();

  if (!query) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-semibold">No search term provided</h2>
          <p className="text-muted-foreground mt-2">Please go back and enter a search term.</p>
        </div>
      </PublicLayout>
    );
  }

  const [categories, providers] = await Promise.all([
    getCategories(),
    getProviders(),
  ]);

  const matchedCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(query)
  );

  const matchedProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(query) ||
    (p.category && p.category.toLowerCase().includes(query))
  );

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 space-y-12">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-headline">
            Results for <span className="text-primary">“{query}”</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {matchedCategories.length + matchedProviders.length} result(s) found
          </p>
        </div>

        {/* Categories */}
        {matchedCategories.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 font-headline">Matching Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {matchedCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>
        )}

        {/* Providers */}
        {matchedProviders.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 font-headline">Matching Service Providers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {matchedProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {matchedCategories.length === 0 && matchedProviders.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/30">
            <h3 className="text-xl font-semibold">No results found for “{query}”</h3>
            <p className="mt-2 text-muted-foreground">
              Try searching for a service like <b>plumber</b>, <b>electrician</b>, or <b>mechanic</b>.
            </p>
          </div>
        )}

      </div>
    </PublicLayout>
  );
}
