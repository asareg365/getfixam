''''use client'; // ⚠️ Make this a client component

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProvidersByCategory } from '@/firebase/services';
import ProviderCard from '@/components/ProviderCard';
import { Provider } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function CategoryPage() {
  const params = useParams();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!params.slug) return;

    setLoading(true);

    getProvidersByCategory(params.slug as string)
      .then((data) => setProviders(data))
      .catch((err) => {
        console.error('Error fetching providers:', err);
        toast({
          title: 'Failed to load providers',
          description: err.message || 'Something went wrong.',
          variant: 'destructive',
        });
      })
      .finally(() => setLoading(false));
  }, [params.slug, toast]);

  if (loading) return <p className="text-center py-8">Loading providers...</p>;

  if (providers.length === 0)
    return <p className="text-center py-8">No providers found in this category.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
      {providers.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}
    </div>
  );
}
'''