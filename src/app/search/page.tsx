import { getCategories } from '@/lib/data';
import { getProviders } from '@/lib/services';
import PublicLayout from '@/components/layout/PublicLayout';
import CategoryCard from '@/components/CategoryCard';
import ProviderCard from '@/components/ProviderCard';
import type { Category, Provider } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search as SearchIcon, MapPin, Grid } from 'lucide-react';

export const dynamic = "force-dynamic";

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string; location?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = (searchParams.q || '').toLowerCase().trim();
  const locationQuery = (searchParams.location || '').toLowerCase().trim();

  const [categories, providers] = await Promise.all([
    getCategories(),
    getProviders(),
  ]);

  // If search is totally empty, show a helpful "Browse" state
  if (!query && !locationQuery) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center space-y-8">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <SearchIcon className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black font-headline">Find what you're looking for</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">Enter a service like "Electrician" or a location like "Kato" to find the best local artisans.</p>
          </div>
          
          <section className="pt-12">
            <h3 className="text-xl font-bold font-headline mb-8">Popular Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
            <Button asChild variant="outline" className="mt-8 rounded-xl font-bold">
                <Link href="/category/all">View All Artisans</Link>
            </Button>
          </section>
        </div>
      </PublicLayout>
    );
  }

  // Filter Categories
  const matchedCategories = categories.filter((cat) =>
    query && (cat.name.toLowerCase().includes(query) || cat.slug.toLowerCase().includes(query))
  );

  // Filter Providers
  const matchedProviders = providers.filter((p) => {
    const matchesQuery = !query || 
      p.name.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query)) ||
      (p.serviceId && p.serviceId.toLowerCase().includes(query));
    
    const matchesLocation = !locationQuery || 
      p.location.zone.toLowerCase().includes(locationQuery) ||
      p.location.city.toLowerCase().includes(locationQuery);

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
              {matchedCategories.length + matchedProviders.length} matching result(s) found
            </p>
          </div>
          <Button asChild variant="secondary" className="rounded-xl font-bold">
            <Link href="/">New Search</Link>
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
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>
        )}

        {matchedProviders.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold mb-6 font-headline flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Matching Service Providers
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
                        <Link href="/category/all">Browse All Directory</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl px-8 h-12 font-bold border-2">
                        <Link href="/add-provider">List a Business</Link>
                    </Button>
                </div>
            </div>
          )
        )}
        
        {/* Always show "Explore other categories" if results are few */}
        {(matchedCategories.length < 6 && matchedProviders.length < 4) && matchedCategories.length > 0 && (
            <section className="pt-12 border-t">
                <h3 className="text-xl font-bold font-headline mb-8">Other Categories to Explore</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories
                        .filter(c => !matchedCategories.find(mc => mc.id === c.id))
                        .slice(0, 6)
                        .map((category) => (
                            <CategoryCard key={category.id} category={category} />
                        ))
                    }
                </div>
            </section>
        )}
      </div>
    </PublicLayout>
  );
}
