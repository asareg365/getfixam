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
        
        const reviewRef = doc(db, 'reviews', reviewId);

        if (action === 'approve') {
            // Approval requires a transaction to update the provider's rating
            runTransaction(db, async (transaction) => {
                const reviewSnap = await transaction.get(reviewRef);
                if (!reviewSnap.exists()) throw new Error('Review document not found.');
                
                const reviewData = reviewSnap.data();
                if (reviewData.status === 'approved') return;

                const providerRef = doc(db, 'providers', reviewData.providerId);
                const providerSnap = await transaction.get(providerRef);
                
                if (!providerSnap.exists()) throw new Error('Associated artisan profile not found.');

                const providerData = providerSnap.data();
                const currentRating = Number(providerData.rating) || 0;
                const currentReviewCount = Number(providerData.reviewCount) || 0;
                const newReviewCount = currentReviewCount + 1;
                
                // Calculate new weighted average
                const reviewRating = Number(reviewData.rating);
                const newRating = ((currentRating * currentReviewCount) + reviewRating) / newReviewCount;

                // Update Provider
                transaction.update(providerRef, {
                    rating: newRating,
                    reviewCount: newReviewCount,
                    updatedAt: serverTimestamp(),
                });

                // Update Review
                transaction.update(reviewRef, {
                    status: 'approved',
                    approvedAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            })
            .then(() => {
                toast({ title: 'Review Approved!', description: 'Artisan reputation has been updated.' });
                router.refresh();
            })
            .catch(async (error: any) => {
                if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
                    const permissionError = new FirestorePermissionError({
                        path: reviewRef.path,
                        operation: 'update',
                    } satisfies SecurityRuleContext);
                    errorEmitter.emit('permission-error', permissionError);
                } else {
                    toast({ title: 'Approval Failed', description: error.message, variant: 'destructive' });
                }
            })
            .finally(() => {
                setLoadingIds(prev => prev.filter(id => id !== reviewId));
            });
        } else {
            // Simple update for rejection
            const updateData = {
                status: 'rejected',
                rejectedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            updateDoc(reviewRef, updateData)
                .then(() => {
                    toast({ title: 'Review Rejected', description: 'This review will not be visible to the public.' });
                    router.refresh();
                })
                .catch(async (error: any) => {
                    if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
                        const permissionError = new FirestorePermissionError({
                            path: reviewRef.path,
                            operation: 'update',
                            requestResourceData: updateData,
                        } satisfies SecurityRuleContext);
                        errorEmitter.emit('permission-error', permissionError);
                    } else {
                        toast({ title: 'Rejection Failed', description: error.message, variant: 'destructive' });
                    }
                })
                .finally(() => {
                    setLoadingIds(prev => prev.filter(id => id !== reviewId));
                });
        }
    };

  if (!reviews || reviews.length === 0) {
    return (
      <p className="text-center py-12 text-muted-foreground italic font-medium">
        No reviews found for this status.
      </p>
    );
  }

  return (
    <div className="border rounded-xl bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/5">
            <TableHead className="font-bold">Author</TableHead>
            <TableHead className="font-bold">Provider</TableHead>
            <TableHead className="font-bold">Rating</TableHead>
            <TableHead className="font-bold">Comment</TableHead>
            <TableHead className="font-bold">Submitted</TableHead>
            <TableHead className="text-right font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {reviews.map((r) => {
            const createdAt = r.createdAt
              ? new Date(r.createdAt).toLocaleDateString()
              : '—';

            return (
              <TableRow key={r.id} className="hover:bg-muted/5 transition-colors">
                <TableCell className="font-bold text-primary">{r.userName}</TableCell>
                <TableCell className="font-medium text-muted-foreground">{r.providerName ?? r.providerId}</TableCell>
                <TableCell>
                    <StarRating rating={r.rating} showText={false} size={14} />
                </TableCell>
                <TableCell>
                    <p className="max-w-[200px] truncate text-sm italic" title={r.comment}>
                        "{r.comment}"
                    </p>
                </TableCell>
                <TableCell className="text-xs font-mono">{createdAt}</TableCell>

                <TableCell className="text-right space-x-2">
                    {r.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                            <Button
                                size="sm"
                                variant="default"
                                className="h-8 rounded-lg font-bold"
                                onClick={() => handleAction(r.id, 'approve')}
                                disabled={loadingIds.includes(r.id)}
                            >
                                {loadingIds.includes(r.id) ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Approve'}
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 rounded-lg font-bold"
                                onClick={() => handleAction(r.id, 'reject')}
                                disabled={loadingIds.includes(r.id)}
                            >
                                Reject
                            </Button>
                        </div>
                    ) : (
                        <Badge variant={r.status === 'approved' ? 'default' : 'destructive'} className="uppercase text-[10px] font-black tracking-wider">
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
