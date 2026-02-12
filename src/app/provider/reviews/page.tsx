'use client';

import { useState, useEffect } from 'react';
import { getProviderData } from '@/lib/provider';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { Provider } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ProviderReviews from '@/components/ProviderReviews';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MessageSquare } from 'lucide-react';

function ReviewsLoading() {
    return (
        <div className="space-y-8">
            <Skeleton className="h-10 w-48" />
            <div className="grid gap-6 md:grid-cols-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
            <Card className="rounded-[32px]">
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </CardContent>
            </Card>
        </div>
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
          const { provider: providerData, error: providerError } = await getProviderData(idToken);
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
        <Card className="max-w-2xl mx-auto border-none shadow-xl rounded-[32px]">
            <CardHeader>
                <CardTitle className="text-destructive font-headline">Could Not Load Reviews</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive" className="rounded-2xl">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error || "Could not find provider data. Please ensure you are logged in correctly."}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-4xl font-black font-headline tracking-tight">Customer Feedback</h1>
                <p className="text-muted-foreground text-lg mt-1 font-medium">Track your reputation and see what clients are saying.</p>
            </div>
            <div className="flex gap-3">
                <div className="bg-white border rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm">
                    <Star className="h-4 w-4 text-accent fill-accent" />
                    <span className="text-sm font-bold">{provider.rating.toFixed(1)} Average</span>
                </div>
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-none shadow-sm rounded-[32px] bg-primary/5">
                <CardContent className="p-8 flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-2xl">
                        <Star className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Rating</p>
                        <p className="text-2xl font-black">{provider.rating.toFixed(1)} / 5.0</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-[32px] bg-secondary/5">
                <CardContent className="p-8 flex items-center gap-4">
                    <div className="bg-secondary/10 p-3 rounded-2xl">
                        <MessageSquare className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total</p>
                        <p className="text-2xl font-black">{provider.reviewCount} Reviews</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-[32px] bg-green-50">
                <CardContent className="p-8 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-2xl">
                        <Star className="h-6 w-6 text-green-600 fill-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                        <p className="text-2xl font-black">{provider.verified ? 'Top Rated' : 'Growing'}</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card className="border-none shadow-xl rounded-[40px] overflow-hidden">
            <CardHeader className="p-10 border-b bg-muted/5">
                <CardTitle className="text-2xl font-black font-headline">Recent Reviews</CardTitle>
                <CardDescription className="text-lg font-medium">Viewing all feedback including those awaiting moderation.</CardDescription>
            </CardHeader>
            <CardContent className="p-10">
                <ProviderReviews 
                    providerId={provider.id} 
                    providerName={provider.name} 
                    showAllStatuses={true} 
                />
            </CardContent>
        </Card>
    </div>
  );
}
