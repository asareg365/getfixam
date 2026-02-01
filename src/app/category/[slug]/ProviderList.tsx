'use client';

import { useState, useEffect } from 'react';
import type { Provider } from '@/lib/types';
import ProviderCard from '@/components/ProviderCard';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type ProviderListProps = {
  initialProviders: Provider[];
  zones: string[];
};

export default function ProviderList({ initialProviders, zones }: ProviderListProps) {
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>(initialProviders);

  // This effect ensures that when navigating between category pages,
  // the provider list is correctly updated with the new initialProviders.
  useEffect(() => {
    setFilteredProviders(initialProviders);
  }, [initialProviders]);

  const handleFilterChange = ({ zone, verified }: { zone: string; verified: boolean }) => {
    let providers = [...initialProviders];

    if (zone) {
      providers = providers.filter(p => p.location.zone === zone);
    }

    if (verified) {
      providers = providers.filter(p => p.verified);
    }

    setFilteredProviders(providers);
  };

  return (
    <div>
      <FilterBar onFilterChange={handleFilterChange} zones={zones} />

      {filteredProviders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={{
                ...provider,
                name: provider.name ?? 'Unknown',
                phone: provider.phone ?? '-',
                category: provider.category ?? 'N/A',
                rating: provider.rating ?? 0,
                reviewCount: provider.reviewCount ?? 0,
                imageId: provider.imageId ?? '',
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <p className="text-xl font-semibold">No Artisans Found</p>
          <p className="text-muted-foreground mt-2">
            No artisans match your current filter criteria. Try clearing the filters.
          </p>
          <Button asChild className="mt-6">
            <Link href="/add-provider">List Your Business</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
