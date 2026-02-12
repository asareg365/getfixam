'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Review } from '@/lib/types';
import { ReviewsTable } from './_components/reviews-table';
import { ReviewTabs } from './_components/review-tabs';
import { Loader2, MessageSquare, ShieldCheck } from 'lucide-react';
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

        // Calculate counts client-side
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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black font-headline text-foreground tracking-tight">Review Moderation</h1>
          <p className="text-muted-foreground text-lg mt-1 font-medium">Verify and approve customer feedback to maintain platform quality.</p>
        </div>
        <div className="bg-white border rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm">
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
            <p className="text-muted-foreground mt-1">Everything is up to date in the "{currentStatus}" category.</p>
        </div>
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
