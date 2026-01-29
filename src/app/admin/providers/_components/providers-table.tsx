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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Provider } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ManageFeatureDialog } from './manage-feature-dialog';
import { useToast } from '@/hooks/use-toast';

interface ProvidersTableProps {
  providers: Provider[];
  onAction?: (providerId: string, action: 'approve' | 'reject' | 'suspend') => Promise<{ success: boolean; error?: string }>;
}

export function ProvidersTable({
  providers,
  onAction,
}: ProvidersTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleAction = async (providerId: string, action: 'approve' | 'reject' | 'suspend') => {
        if (!onAction) return;
        setLoadingId(providerId);
        const result = await onAction(providerId, action);
        setLoadingId(null);
        if (result.success) {
            toast({
                title: 'Action Successful',
                description: `Provider has been updated.`,
            });
        } else {
            toast({
                title: 'Action Failed',
                description: result.error || 'An unexpected error occurred.',
                variant: 'destructive',
            });
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
            <TableHead>Featured</TableHead>
            <TableHead>Created</TableHead>
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
                
                <TableCell>
                  {p.isFeatured ? 'Yes' : 'No'}
                </TableCell>

                <TableCell>{createdAt}</TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={loadingId === p.id}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {p.status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => handleAction(p.id, 'approve')}>
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(p.id, 'reject')} className="text-destructive">
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}

                      {p.status === 'approved' && (
                         <ManageFeatureDialog provider={p}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                Manage Feature
                            </DropdownMenuItem>
                        </ManageFeatureDialog>
                      )}

                      {(p.status === 'approved' || p.status === 'suspended') && (
                        <DropdownMenuItem onClick={() => handleAction(p.id, 'suspend')}>
                         {p.status === 'suspended' ? 'Re-Approve' : 'Suspend'}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
