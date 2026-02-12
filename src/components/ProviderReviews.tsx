'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Review } from '@/lib/types';
import ReviewCard from '@/components/ReviewCard';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Badge } from '@/components/ui/badge';

type ProviderReviewsProps = {
  providerId: string;
  providerName: string;
  showAllStatuses?: boolean; // If true, shows pending/rejected (for artisan view)
};

export default function ProviderReviews({ 
    providerId, 
    providerName, 
    showAllStatuses = false 
}: ProviderReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const reviewsRef = collection(db, 'reviews');
      
      // Simple query to avoid composite index requirement
      const q = query(
        reviewsRef,
        where('providerId', '==', providerId)
      );

      getDocs(q)
        .then((reviewsSnap) => {
          if (!reviewsSnap.empty) {
            const reviewData = reviewsSnap.docs
              .map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  providerId: data.providerId,
                  userName: data.userName,
                  rating: data.rating,
                  comment: data.comment,
                  createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : new Date(0).toISOString(),
                  userImageId: data.userImageId,
                  status: data.status,
                } as Review;
              })
              // Filter and sort client-side for maximum reliability
              .filter(r => showAllStatuses ? true : r.status === 'approved')
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            setReviews(reviewData);
          }
        })
        .catch(async (serverError: any) => {
          if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: reviewsRef.path,
              operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchReviews();
  }, [providerId, showAllStatuses]);

  if (loading) {
    return <div className="text-center py-16 text-muted-foreground animate-pulse">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-[32px] bg-muted/10">
        <h3 className="text-xl font-bold font-headline">No Reviews Yet</h3>
        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
          {showAllStatuses 
            ? "You haven't received any customer reviews yet." 
            : `Be the first to share your experience with ${providerName}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="relative">
            {showAllStatuses && (
                <div className="absolute top-4 right-4 z-10">
                    <Badge variant={review.status === 'approved' ? 'default' : review.status === 'pending' ? 'secondary' : 'destructive'} className="uppercase text-[10px] font-black">
                        {review.status}
                    </Badge>
                </div>
            )}
            <ReviewCard review={review} />
        </div>
      ))}
    </div>
  );
}
