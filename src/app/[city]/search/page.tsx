import { getCategories } from '@/lib/data';
import { getProviders } from '@/lib/services';
import { getCityConfig } from '@/lib/constants';
import PublicLayout from '@/components/layout/PublicLayout';
import CategoryCard from '@/components/CategoryCard';
import ProviderCard from '@/components/ProviderCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search as SearchIcon, MapPin, Grid } from 'lucide-react';

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ q?: string; location?: string }>;
};

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { city } = await params;
  const { q, location } = await searchParams;
  const config = getCityConfig(city);
  
  const query = (q || '').toLowerCase().trim();
  const locationQuery = (location || '').toLowerCase().trim();

  const [categories, providers] = await Promise.all([
    getCategories(),
    getProviders(city),
  ]);

  if (!query && !locationQuery) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center space-y-8">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <SearchIcon className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black font-headline">Find what you're looking for in {config.name}</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">Enter a service or a neighborhood to find the best local artisans.</p>
          </div>
          
          <section className="pt-12">
            <h3 className="text-xl font-bold font-headline mb-8">Popular Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <CategoryCard key={category.id} category={category} city={city} />
              ))}
            </div>
            <Button asChild variant="outline" className="mt-8 rounded-xl font-bold">
                <Link href={`/${city}/category/all`}>View All Artisans</Link>
            </Button>
          </section>
        </div>
      </PublicLayout>
    );
  }

  const matchedCategories = categories.filter((cat) =>
    query && (cat.name.toLowerCase().includes(query) || cat.slug.toLowerCase().includes(query))
  );

  const matchedProviders = providers.filter((p) => {
    const matchesQuery = !query || 
      p.name.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query));
    
    const matchesLocation = !locationQuery || 
      p.location.zone.toLowerCase().includes(locationQuery);

    return matchesQuery && matchesLocation;
  });

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black font-headline tracking-tight">
              {query || locationQuery ? (
                <>
                    Results for {query && <span className="text-primary">“{query}”</span>}
                    {query && locationQuery && <span> in </span>}
                    {locationQuery && <span className="text-primary">“{locationQuery}”</span>}
                </>
              ) : "All Results"}
            </h1>
            <p className="text-muted-foreground mt-1 font-medium">
              {matchedCategories.length + matchedProviders.length} matching result(s) found in {config.name}
            </p>
          </div>
          <Button asChild variant="secondary" className="rounded-xl font-bold">
            <Link href={`/${city}`}>New Search</Link>
          </Button>
        </div>

        {matchedCategories.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 font-headline flex items-center gap-2">
                <Grid className="h-6 w-6 text-primary" />
                Matching Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {matchedCategories.map((category) => (
                <CategoryCard key={category.id} category={category} city={city} />
              ))}
            </div>
          </section>
        )}

        {matchedProviders.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold mb-6 font-headline flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Artisans in {config.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {matchedProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </section>
        ) : (
          matchedCategories.length === 0 && (
            <div className="text-center py-24 border-2 border-dashed rounded-[40px] bg-muted/5">
                <div className="bg-muted/20 p-6 rounded-full w-fit mx-auto mb-4">
                    <SearchIcon className="h-12 w-12 text-muted-foreground/40" />
                </div>
                <h3 className="text-2xl font-bold font-headline">No exact matches found</h3>
                <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                    Try using broader keywords like "Repair" or browse all categories below.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Button asChild className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20">
                        <Link href={`/${city}/category/all`}>Browse All Directory</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl px-8 h-12 font-bold border-2">
                        <Link href={`/${city}/add-provider`}>List a Business</Link>
                    </Button>
                </div>
            </div>
          )
        )}
      </div>
    </PublicLayout>
  );
}
