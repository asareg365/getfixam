'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, getCountFromServer } from 'firebase/firestore';
import type { Provider } from '@/lib/types';
import { ProvidersTable } from './_components/providers-table';
import { ProviderTabs } from './_components/provider-tabs';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

function ProvidersPage() {
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'pending';
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch services first to map category names
        const servicesRef = collection(db, 'services');
        const servicesSnap = await getDocs(servicesRef).catch(async (err) => {
            if (err.code === 'permission-denied' || err.message?.includes('permissions')) {
                const permissionError = new FirestorePermissionError({
                    path: servicesRef.path,
                    operation: 'list',
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
                return null;
            }
            throw err;
        });

        if (!servicesSnap) return;

        const servicesMap = new Map();
        servicesSnap.forEach(doc => servicesMap.set(doc.id, doc.data().name));

        // Fetch providers based on status
        const providersRef = collection(db, 'providers');
        let q;
        
        if (currentStatus !== 'all') {
          q = query(providersRef, where('status', '==', currentStatus), orderBy('createdAt', 'desc'));
        } else {
          q = query(providersRef, orderBy('createdAt', 'desc'));
        }

        const snap = await getDocs(q).catch(async (err) => {
            if (err.code === 'permission-denied' || err.message?.includes('permissions')) {
                const permissionError = new FirestorePermissionError({
                    path: providersRef.path,
                    operation: 'list',
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
                return null;
            }
            throw err;
        });

        if (!snap) return;

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
          try {
            const countSnap = await getCountFromServer(query(providersRef, where('status', '==', s)));
            newCounts[s] = countSnap.data().count;
          } catch (e) {
            newCounts[s] = 0;
          }
        }));
        
        try {
            const allCountSnap = await getCountFromServer(providersRef);
            newCounts['all'] = allCountSnap.data().count;
        } catch (e) {
            newCounts['all'] = providersData.length;
        }
        
        setCounts(newCounts);
      } catch (err: any) {
        if (err instanceof FirestorePermissionError) return;
        setError(err.message || "Failed to load providers.");
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

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Access Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ProviderTabs currentStatus={currentStatus as any} counts={counts} />
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading directory...</p>
          </div>
        </div>
      ) : !error ? (
        <ProvidersTable providers={providers} />
      ) : null}
    </div>
  );
}

export default function ProvidersPageWithSuspense() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProvidersPage />
        </Suspense>
    );
}
