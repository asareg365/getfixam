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
import type { Provider } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ProvidersTableProps {
  providers: Provider[];
}

export function ProvidersTable({
  providers
}: ProvidersTableProps) {
    const router = useRouter();
    const [loadingIds, setLoadingIds] = useState<string[]>([]);
    const { toast } = useToast();

    const handleAction = async (providerId: string, action: 'approve' | 'reject' | 'suspend') => {
        try {
            setLoadingIds(prev => [...prev, providerId]);

            const formData = new FormData();
            formData.set('providerId', providerId);

            const res = await fetch(`/admin/providers/${action}`, {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();

            if (result.success) {
                toast({ title: `Provider ${action}d successfully!`, variant: 'success' });
                router.refresh();
            } else {
                toast({ title: `Failed to ${action} provider`, description: result.error, variant: 'destructive' });
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Unexpected error', variant: 'destructive' });
        } finally {
            setLoadingIds(prev => prev.filter(id => id !== providerId));
        }
    };


  if (!providers || providers.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        No providers found for this status.
      </p>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Audit Info</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {providers.map((p) => {
            const createdAt = p.createdAt
              ? new Date(p.createdAt).toLocaleDateString()
              : '—';

            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <div>{p.name ?? 'Unnamed'}</div>
                  <div className="text-xs text-muted-foreground">{p.phone}</div>
                  <div className="text-xs text-muted-foreground font-mono">{p.digitalAddress}</div>
                </TableCell>

                <TableCell>{p.category ?? 'N/A'}</TableCell>

                <TableCell>
                  <Badge variant={
                    p.status === 'approved'
                      ? 'success'
                      : p.status === 'rejected'
                      ? 'destructive'
                      : p.status === 'suspended'
                      ? 'destructive'
                      : 'secondary'
                  }>
                    {p.status ?? 'pending'}
                  </Badge>
                </TableCell>

                <TableCell>{createdAt}</TableCell>

                <TableCell>
                  {p.status === 'approved' && p.approvedBy && p.approvedAt ? (
                    <div className="text-xs text-muted-foreground">
                      by {p.approvedBy}<br/>on {new Date(p.approvedAt).toLocaleDateString()}
                    </div>
                  ) : p.status === 'rejected' && p.rejectedBy && p.rejectedAt ? (
                    <div className="text-xs text-muted-foreground">
                      by {p.rejectedBy}<br/>on {new Date(p.rejectedAt).toLocaleDateString()}
                    </div>
                  ) :  p.status === 'suspended' && p.suspendedBy && p.suspendedAt ? (
                    <div className="text-xs text-muted-foreground">
                      by {p.suspendedBy}<br/>on {new Date(p.suspendedAt).toLocaleDateString()}
                    </div>
                  ): (
                    '—'
                  )}
                </TableCell>

                <TableCell className="text-right space-x-2">
                    {p.status === 'pending' && (
                        <>
                        <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleAction(p.id, 'approve')}
                            disabled={loadingIds.includes(p.id)}
                        >
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(p.id, 'reject')}
                            disabled={loadingIds.includes(p.id)}
                        >
                            Reject
                        </Button>
                        </>
                    )}
                    {p.status === 'approved' && (
                         <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(p.id, 'suspend')}
                            disabled={loadingIds.includes(p.id)}
                        >
                            Suspend
                        </Button>
                    )}
                     {(p.status === 'rejected' || p.status === 'suspended') && (
                        <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleAction(p.id, 'approve')}
                            disabled={loadingIds.includes(p.id)}
                        >
                            Approve
                        </Button>
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
