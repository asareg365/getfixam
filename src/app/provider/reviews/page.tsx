'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getProviderDataAndLinkAccount } from '../actions';
import type { Provider } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ProviderReviews from '@/components/ProviderReviews';
import { Skeleton } from '@/components/ui/skeleton';

function ReviewsLoading() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
    )
}

export default function ProviderReviewsPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          const { provider: providerData, error: providerError } = await getProviderDataAndLinkAccount(idToken);
          if (providerError) setError(providerError);
          else setProvider(providerData);
        } catch(e: any) {
            setError(e.message || 'An error occurred.');
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <ReviewsLoading />;
  }

  if (error || !provider) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Could Not Load Reviews</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error || "Could not find provider data."}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Your Customer Reviews</CardTitle>
            <CardDescription>See what your customers are saying about your service.</CardDescription>
        </CardHeader>
        <CardContent>
            <ProviderReviews providerId={provider.id} providerName={provider.name} />
        </CardContent>
    </Card>
  );
}
