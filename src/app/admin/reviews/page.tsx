'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, getDocs, query, orderBy, where } from 'firebase/firestore';
import type { Review } from '@/lib/types';
import { ReviewsTable } from './_components/reviews-table';
import { ReviewTabs } from './_components/review-tabs';
import { Loader2, MessageSquare, ShieldCheck } from 'lucide-react';
import { getCityConfig } from '@/lib/constants';

function ReviewsPage() {
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'pending';
  const cityId = searchParams.get('city');
  const cityConfig = cityId ? getCityConfig(cityId) : null;

  const [reviews, setReviews] = useState<(Review & { providerName: string })[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
      all: 0, pending: 0, approved: 0, rejected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    async function initData() {
        // Fetch providers map for naming and city filtering
        const providersRef = collection(db, 'providers');
        const providersSnap = await getDocs(providersRef).catch(() => null);
        
        const providersMap = new Map();
        const cityProviderIds = new Set<string>();

        if (providersSnap) {
            providersSnap.forEach(doc => {
                const data = doc.data();
                providersMap.set(doc.id, data.name);
                if (cityConfig && data.location?.city === cityConfig.name) {
                    cityProviderIds.add(doc.id);
                }
            });
        }
        return { providersMap, cityProviderIds };
    }

    let unsubscribe: () => void;

    initData().then(({ providersMap, cityProviderIds }) => {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, orderBy('createdAt', 'desc'));

        unsubscribe = onSnapshot(q, (snap) => {
            const allReviews = snap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    providerName: providersMap.get(data.providerId) || 'Unknown Provider',
                    createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
                } as (Review & { providerName: string });
            });

            // Filter by city if applicable
            const cityFiltered = cityConfig 
                ? allReviews.filter(r => cityProviderIds.has(r.providerId))
                : allReviews;

            // Filter for the current tab
            const tabFiltered = currentStatus === 'all' 
                ? cityFiltered 
                : cityFiltered.filter(r => r.status === currentStatus);
            
            setReviews(tabFiltered);

            // Update counts for the current city
            const newCounts = { all: cityFiltered.length, pending: 0, approved: 0, rejected: 0 };
            cityFiltered.forEach(r => {
                if (r.status in newCounts) (newCounts as any)[r.status]++;
            });
            setCounts(newCounts);
            setLoading(false);
        });
    });

    return () => unsubscribe?.();
  }, [currentStatus, cityConfig?.name]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black font-headline text-foreground tracking-tight leading-tight">
              Review Moderation {cityConfig && <span className="text-primary">({cityConfig.name})</span>}
          </h1>
          <p className="text-muted-foreground text-lg mt-1 font-medium">Verify and approve customer feedback to maintain platform quality.</p>
        </div>
        <div className="bg-white border rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm shrink-0 h-fit">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">Trust & Safety Active</span>
        </div>
      </div>

      <ReviewTabs currentStatus={currentStatus as any} counts={counts} />
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="bg-white rounded-[32px] border shadow-sm overflow-hidden">
            <ReviewsTable reviews={reviews} />
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed rounded-[40px] bg-muted/5">
            <div className="bg-muted/20 p-6 rounded-full w-fit mx-auto mb-4">
                <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-xl font-bold">No reviews found</h2>
            <p className="text-muted-foreground mt-1">
                {cityConfig 
                    ? `Everything is up to date in the "${currentStatus}" category for ${cityConfig.name}.`
                    : `Everything is up to date in the "${currentStatus}" category.`}
            </p>
        </div>
      )}
    </div>
  );
}

export default function ReviewsPageWithSuspense() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
      <ReviewsPage />
    </Suspense>
  );
}
