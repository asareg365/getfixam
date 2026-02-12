
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Review } from '@/lib/types';
import { ReviewsTable } from './_components/reviews-table';
import { ReviewTabs } from './_components/review-tabs';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

function ReviewsPage() {
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'pending';

  const [reviews, setReviews] = useState<(Review & { providerName: string })[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const providersRef = collection(db, 'providers');
        const providersSnap = await getDocs(providersRef).catch(async (err) => {
            if (err.code === 'permission-denied') {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: providersRef.path,
                    operation: 'list',
                } satisfies SecurityRuleContext));
                return null;
            }
            throw err;
        });

        if (!providersSnap) {
            setLoading(false);
            return;
        }

        const providersMap = new Map();
        providersSnap.forEach(doc => providersMap.set(doc.id, doc.data().name));

        const reviewsRef = collection(db, 'reviews');
        // Simple collection query to avoid index errors
        const snap = await getDocs(reviewsRef).catch(async (err) => {
            if (err.code === 'permission-denied') {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: reviewsRef.path,
                    operation: 'list',
                } satisfies SecurityRuleContext));
                return null;
            }
            throw err;
        });

        if (!snap) {
            setLoading(false);
            return;
        }

        const allReviews = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            providerName: providersMap.get(data.providerId) || 'Unknown Provider',
            createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : new Date(0).toISOString(),
          } as (Review & { providerName: string });
        });

        // Client-side filter and sort for reliability
        const filteredReviews = allReviews
            .filter(r => currentStatus === 'all' ? true : r.status === currentStatus)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setReviews(filteredReviews);

        // Calculate counts client-side to save requests and avoid index errors
        const newCounts: Record<string, number> = {
            all: allReviews.length,
            pending: allReviews.filter(r => r.status === 'pending').length,
            approved: allReviews.filter(r => r.status === 'approved').length,
            rejected: allReviews.filter(r => r.status === 'rejected').length,
        };
        setCounts(newCounts);
        
      } catch (err) {
        // Handle unexpected errors
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentStatus]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Customer Reviews</h1>
        <p className="text-muted-foreground">Moderate and manage reviews submitted by customers.</p>
      </div>

      <ReviewTabs currentStatus={currentStatus as any} counts={counts} />
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ReviewsTable reviews={reviews} />
      )}
    </div>
  );
}

export default function ReviewsPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewsPage />
    </Suspense>
  );
}
