'use client';

import { useState, useEffect } from 'react';
import type { Provider } from '@/lib/types';
import ProviderCard from '@/components/ProviderCard';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Inbox } from 'lucide-react';

type ProviderListProps = {
  slug: string;
  initialProviders: Provider[];
  zones: string[];
};

/**
 * Standardized Artisan Listing Component.
 * Uses pre-fetched server data for initial render and handles client-side filtering.
 */
export default function ProviderList({ initialProviders, zones }: ProviderListProps) {
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>(initialProviders);

  // Sync state if initialProviders changes (e.g. navigation between categories)
  useEffect(() => {
    setFilteredProviders(initialProviders);
  }, [initialProviders]);

  const handleFilterChange = ({ zone, verified }: { zone: string | undefined; verified: boolean }) => {
    let providers = [...initialProviders];

    if (zone && zone !== 'all') {
      providers = providers.filter(p => p.location.zone === zone);
    }

    if (verified) {
      providers = providers.filter(p => p.verified);
    }

    setFilteredProviders(providers);
  };

  return (
    <div className="space-y-8">
      <FilterBar onFilterChange={handleFilterChange} zones={zones} />

      {filteredProviders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed rounded-[32px] bg-muted/5">
          <div className="bg-muted/20 p-6 rounded-full w-fit mx-auto mb-4">
            <Inbox className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <h3 className="text-2xl font-bold font-headline">No Artisans Found</h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            We couldn't find any professionals matching your filters in this category.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20">
              <Link href="/add-provider">List Your Business</Link>
            </Button>
            <Button variant="outline" onClick={() => handleFilterChange({ zone: undefined, verified: false })} className="rounded-xl px-8 h-12 font-bold border-2">
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
