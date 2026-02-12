
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Review } from '@/lib/types';
import ReviewCard from '@/components/ReviewCard';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ProviderReviews({ providerId, providerName }: { providerId: string; providerName: string; }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const reviewsRef = collection(db, 'reviews');
      
      // Simple query to avoid composite index requirement
      // We filter for 'approved' and sort client-side for maximum reliability
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
              // Client-side filter and sort to prevent 403 index errors
              .filter(r => r.status === 'approved')
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
  }, [providerId]);

  if (loading) {
    return <div className="text-center py-16 text-muted-foreground">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <h3 className="text-xl font-semibold">No Reviews Yet</h3>
        <p className="text-muted-foreground mt-2">
          Be the first to share your experience with {providerName}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
