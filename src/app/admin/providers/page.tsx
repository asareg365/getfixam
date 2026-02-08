'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, getCountFromServer } from 'firebase/firestore';
import type { Provider } from '@/lib/types';
import { ProvidersTable } from './_components/providers-table';
import { ProviderTabs } from './_components/provider-tabs';
import { Loader2 } from 'lucide-react';

export default function ProvidersPage() {
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'pending';
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch services first to map category names
        const servicesSnap = await getDocs(collection(db, 'services'));
        const servicesMap = new Map();
        servicesSnap.forEach(doc => servicesMap.set(doc.id, doc.data().name));

        // Fetch providers based on status
        const providersRef = collection(db, 'providers');
        let q = query(providersRef, orderBy('createdAt', 'desc'));
        
        if (currentStatus !== 'all') {
          q = query(providersRef, where('status', '==', currentStatus), orderBy('createdAt', 'desc'));
        }

        const snap = await getDocs(q);
        const providersData = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            category: servicesMap.get(data.serviceId) || 'N/A',
            createdAt: data.createdAt?.toDate()?.toISOString(),
            approvedAt: data.approvedAt?.toDate()?.toISOString(),
          } as Provider;
        });

        setProviders(providersData);

        // Fetch counts for tabs
        const statuses = ['pending', 'approved', 'rejected', 'suspended'];
        const newCounts: Record<string, number> = {};
        
        await Promise.all(statuses.map(async (s) => {
          const countSnap = await getCountFromServer(query(providersRef, where('status', '==', s)));
          newCounts[s] = countSnap.data().count;
        }));
        
        const allCountSnap = await getCountFromServer(providersRef);
        newCounts['all'] = allCountSnap.data().count;
        
        setCounts(newCounts);
      } catch (err) {
        console.error("Error fetching providers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentStatus]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black font-headline text-foreground">Artisan Directory</h1>
        <p className="text-muted-foreground text-lg mt-1 font-medium">Review and manage verified professionals across the country.</p>
      </div>

      <ProviderTabs currentStatus={currentStatus as any} counts={counts} />
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ProvidersTable providers={providers} />
      )}
    </div>
  );
}