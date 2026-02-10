'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, getCountFromServer } from 'firebase/firestore';
import type { Review } from '@/lib/types';
import { ReviewsTable } from './_components/reviews-table';
import { ReviewTabs } from './_components/review-tabs';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function ReviewsPage() {
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

        if (!providersSnap) {
            setLoading(false);
            return;
        }

        const providersMap = new Map();
        providersSnap.forEach(doc => providersMap.set(doc.id, doc.data().name));

        const reviewsRef = collection(db, 'reviews');
        let q = query(reviewsRef, orderBy('createdAt', 'desc'));

        if (currentStatus !== 'all') {
          q = query(reviewsRef, where('status', '==', currentStatus), orderBy('createdAt', 'desc'));
        }

        const snap = await getDocs(q).catch(async (err) => {
            if (err.code === 'permission-denied' || err.message?.includes('permissions')) {
                const permissionError = new FirestorePermissionError({
                    path: reviewsRef.path,
                    operation: 'list',
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
                return null;
            }
            throw err;
        });

        if (!snap) {
            setLoading(false);
            return;
        }

        const reviewsData = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            providerName: providersMap.get(data.providerId) || 'Unknown Provider',
            createdAt: data.createdAt?.toDate()?.toISOString(),
          } as (Review & { providerName: string });
        });

        setReviews(reviewsData);

        // Counts
        const statuses = ['pending', 'approved', 'rejected'];
        const newCounts: Record<string, number> = {};
        
        await Promise.all(statuses.map(async (s) => {
          try {
            const countSnap = await getCountFromServer(query(reviewsRef, where('status', '==', s)));
            newCounts[s] = countSnap.data().count;
          } catch (e) {
            newCounts[s] = 0;
          }
        }));
        
        try {
            const allCountSnap = await getCountFromServer(reviewsRef);
            newCounts['all'] = allCountSnap.data().count;
        } catch (e) {
            newCounts['all'] = reviewsData.length;
        }
        
        setCounts(newCounts);
      } catch (err) {
        // Non-permission errors handled silently
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
