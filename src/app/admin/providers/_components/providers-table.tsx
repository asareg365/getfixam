'use client';

import { useState } from 'react';
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
    const [loadingIds, setLoadingIds] = useState<string[]>([]);
    const [localProviders, setLocalProviders] = useState(providers);
    const { toast } = useToast();

    const handleAction = async (providerId: string, action: 'approve' | 'reject') => {
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

                // Update local state to reflect new status
                setLocalProviders(prev =>
                    prev.map(p => p.id === providerId ? { ...p, status: action === 'approve' ? 'approved' : 'rejected', verified: action === 'approve' } : p)
                );
            } else {
                toast({ title: `Failed to ${action} provider`, description: result.error, variant: 'destructive' });
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Unexpected error', variant: 'destructive' });
        } finally {
            setLoadingIds(prev => prev.filter(id => id !== providerId));
        }
    };


  if (!localProviders || localProviders.length === 0) {
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
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {localProviders.map((p) => {
            const createdAt = p.createdAt
              ? new Date(p.createdAt).toLocaleDateString()
              : '—';

            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <div>{p.name ?? 'Unnamed'}</div>
                  <div className="text-xs text-muted-foreground">{p.phone}</div>
                </TableCell>

                <TableCell>{p.category ?? 'N/A'}</TableCell>

                <TableCell>
                  <Badge variant={
                    p.status === 'approved'
                      ? 'success'
                      : p.status === 'rejected'
                      ? 'destructive'
                      : p.status === 'suspended'
                      ? 'outline'
                      : 'secondary'
                  }>
                    {p.status ?? 'pending'}
                  </Badge>
                </TableCell>

                <TableCell>{createdAt}</TableCell>

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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
