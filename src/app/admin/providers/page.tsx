'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import type { Provider } from '@/lib/types';
import { ProvidersTable } from './_components/providers-table';
import { ProviderTabs } from './_components/provider-tabs';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CATEGORIES } from '@/lib/constants';

function ProvidersPage() {
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'pending';
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
      all: 0, pending: 0, approved: 0, rejected: 0, suspended: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // 1. Fetch services first to map category names
    async function initServices() {
        const servicesSnap = await getDocs(collection(db, 'services')).catch(() => null);
        const servicesMap = new Map();
        if (servicesSnap) {
            servicesSnap.forEach(doc => servicesMap.set(doc.id, doc.data().name));
        }
        return servicesMap;
    }

    let unsubscribe: () => void;

    initServices().then((servicesMap) => {
        const providersRef = collection(db, 'providers');
        
        // Listener for the active list
        const listQuery = currentStatus === 'all' 
            ? query(providersRef, orderBy('createdAt', 'desc'))
            : query(providersRef, where('status', '==', currentStatus), orderBy('createdAt', 'desc'));

        const unsubList = onSnapshot(listQuery, (snap) => {
            const providersData = snap.docs.map(doc => {
                const data = doc.data();
                let categoryName = servicesMap.get(data.serviceId);
                if (!categoryName) {
                    const staticCat = CATEGORIES.find(c => c.id === data.serviceId || c.slug === data.serviceId);
                    categoryName = staticCat?.name || data.category || 'Artisan';
                }

                return {
                    id: doc.id,
                    ...data,
                    category: categoryName,
                    createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
                    approvedAt: data.approvedAt?.toDate?.() ? data.approvedAt.toDate().toISOString() : data.approvedAt,
                } as Provider;
            });
            setProviders(providersData);
            setLoading(false);
        }, (err) => {
            setError("Failed to sync directory updates.");
            setLoading(false);
        });

        // Listener for counts (simplified for prototype)
        const unsubCounts = onSnapshot(providersRef, (snap) => {
            const newCounts: Record<string, number> = {
                all: snap.size,
                pending: 0,
                approved: 0,
                rejected: 0,
                suspended: 0
            };
            snap.forEach(doc => {
                const s = doc.data().status;
                if (s && s in newCounts) newCounts[s]++;
            });
            setCounts(newCounts);
        });

        unsubscribe = () => {
            unsubList();
            unsubCounts();
        };
    });

    return () => unsubscribe?.();
  }, [currentStatus]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black font-headline text-foreground">Artisan Directory</h1>
        <p className="text-muted-foreground text-lg mt-1 font-medium">Review and manage verified professionals across the country.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ProviderTabs currentStatus={currentStatus as any} counts={counts} />
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Syncing directory...</p>
          </div>
        </div>
      ) : providers.length > 0 ? (
        <ProvidersTable providers={providers} />
      ) : (
        <div className="py-24 text-center border-2 border-dashed rounded-[40px] bg-muted/5">
            <div className="bg-muted/20 p-6 rounded-full w-fit mx-auto mb-4">
                <Inbox className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-xl font-bold">No providers found</h2>
            <p className="text-muted-foreground mt-1">There are no artisans with the status "{currentStatus}".</p>
        </div>
      )}
    </div>
  );
}

export default function ProvidersPageWithSuspense() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <ProvidersPage />
        </Suspense>
    );
}
