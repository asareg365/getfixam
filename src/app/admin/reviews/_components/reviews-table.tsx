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

interface ReviewsTableProps {
  reviews: (Review & { providerName?: string })[];
}

export function ReviewsTable({ reviews }: ReviewsTableProps) {
    const router = useRouter();
    const [loadingIds, setLoadingIds] = useState<string[]>([]);
    const { toast } = useToast();

    const handleAction = async (reviewId: string, action: 'approve' | 'reject') => {
        try {
            setLoadingIds(prev => [...prev, reviewId]);

            const formData = new FormData();
            formData.set('reviewId', reviewId);

            const res = await fetch(`/admin/reviews/${action}`, {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();

            if (result.success) {
                toast({ title: `Review ${action}d successfully!`, variant: 'success' });
                router.refresh();
            } else {
                toast({ title: `Failed to ${action} review`, description: result.error, variant: 'destructive' });
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Unexpected error', variant: 'destructive' });
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
    <div className="border rounded-lg">
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
                            variant="success"
                            onClick={() => handleAction(r.id, 'approve')}
                            disabled={loadingIds.includes(r.id)}
                        >
                            Approve
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
                            r.status === 'approved' ? 'success' : 'destructive'
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
