'use client';

import { useEffect, useState } from "react";
import { getProvidersByCategory } from "@/lib/services-client";
import ProviderCard from "@/components/ProviderCard";
import { Provider } from "@/lib/types";

export default function ProviderList({ slug }: { slug: string }) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      async function fetchProviders() {
        setLoading(true);
        const data = await getProvidersByCategory(slug);
        setProviders(data);
        setLoading(false);
      }
      fetchProviders();
    }
  }, [slug]);

  if (loading) return <p className="text-center py-8">Loading providers...</p>;
  if (!providers.length) return <p className="text-center py-8">No providers found in this category.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
      {providers.map((p) => (
        <ProviderCard key={p.id} provider={p} />
      ))}
    </div>
  );
}
