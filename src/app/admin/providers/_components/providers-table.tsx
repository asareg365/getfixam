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
import { ManageFeatureDialog } from './manage-feature-dialog';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProvidersTableProps {
  providers: Provider[];
  onApprove?: (providerId: string) => void;
  onReject?: (providerId: string) => void;
  onSuspend?: (providerId: string) => void;
  loadingId?: string | null;
}

export function ProvidersTable({
  providers,
  onApprove,
  onReject,
  onSuspend,
  loadingId,
}: ProvidersTableProps) {
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
                          <DropdownMenuItem onClick={() => onApprove?.(p.id)}>
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReject?.(p.id)} className="text-destructive">
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
                        <DropdownMenuItem onClick={() => onSuspend?.(p.id)}>
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
