'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Review } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import StarRating from '@/components/StarRating';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Loader2 } from 'lucide-react';

interface ReviewsTableProps {
  reviews: (Review & { providerName?: string })[];
}

export function ReviewsTable({ reviews }: ReviewsTableProps) {
    const router = useRouter();
    const [loadingIds, setLoadingIds] = useState<string[]>([]);
    const { toast } = useToast();

    const handleAction = async (reviewId: string, action: 'approve' | 'reject') => {
        setLoadingIds(prev => [...prev, reviewId]);
        
        try {
            const reviewRef = doc(db, 'reviews', reviewId);
            
            if (action === 'approve') {
                // Approval requires a transaction to update the provider's rating
                await runTransaction(db, async (transaction) => {
                    const reviewSnap = await transaction.get(reviewRef);
                    if (!reviewSnap.exists()) throw new Error('Review not found.');
                    
                    const reviewData = reviewSnap.data();
                    if (reviewData.status === 'approved') return;

                    const providerRef = doc(db, 'providers', reviewData.providerId);
                    const providerSnap = await transaction.get(providerRef);
                    if (!providerSnap.exists()) throw new Error('Associated provider not found.');

                    const providerData = providerSnap.data();
                    const currentRating = providerData.rating || 0;
                    const currentReviewCount = providerData.reviewCount || 0;
                    const newReviewCount = currentReviewCount + 1;
                    const newRating = ((currentRating * currentReviewCount) + reviewData.rating) / newReviewCount;

                    transaction.update(providerRef, {
                        rating: newRating,
                        reviewCount: newReviewCount,
                        updatedAt: serverTimestamp(),
                    });

                    transaction.update(reviewRef, {
                        status: 'approved',
                        approvedAt: serverTimestamp(),
                    });
                });
            } else {
                // Simple update for rejection
                const updateData = {
                    status: 'rejected',
                    rejectedAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                };
                await updateDoc(reviewRef, updateData);
            }

            toast({ title: `Review ${action}d successfully!`, variant: 'default' });
            router.refresh();
        } catch (error: any) {
            // Handle permission errors using the central architecture
            if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
                const permissionError = new FirestorePermissionError({
                    path: `reviews/${reviewId}`,
                    operation: 'update',
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
            } else {
                toast({ title: `Failed to ${action} review`, description: error.message, variant: 'destructive' });
            }
        } finally {
            setLoadingIds(prev => prev.filter(id => id !== reviewId));
        }
    };


  if (!reviews || reviews.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        No reviews found for this status.
      </p>
    );
  }

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Author</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {reviews.map((r) => {
            const createdAt = r.createdAt
              ? new Date(r.createdAt).toLocaleDateString()
              : '—';

            return (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.userName}</TableCell>
                <TableCell>{r.providerName ?? r.providerId}</TableCell>
                <TableCell>
                    <StarRating rating={r.rating} showText={false} />
                </TableCell>
                <TableCell><p className="max-w-xs truncate">{r.comment}</p></TableCell>
                <TableCell>{createdAt}</TableCell>

                <TableCell className="text-right space-x-2">
                    {r.status === 'pending' && (
                        <>
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAction(r.id, 'approve')}
                            disabled={loadingIds.includes(r.id)}
                        >
                            {loadingIds.includes(r.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(r.id, 'reject')}
                            disabled={loadingIds.includes(r.id)}
                        >
                            Reject
                        </Button>
                        </>
                    )}
                    {r.status !== 'pending' && (
                        <Badge variant={
                            r.status === 'approved' ? 'default' : 'destructive'
                        }>
                            {r.status}
                        </Badge>
                    )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
