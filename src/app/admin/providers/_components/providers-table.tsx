'use client';

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Verified</TableHead>
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
                {p.name ?? 'Unnamed'}
              </TableCell>

              <TableCell>{p.phone ?? '-'}</TableCell>

              <TableCell>{p.category ?? 'N/A'}</TableCell>

              <TableCell>
                <Badge variant={
                  p.status === 'approved'
                    ? 'success'
                    : p.status === 'rejected'
                    ? 'destructive'
                    : 'secondary'
                }>
                  {p.status ?? 'pending'}
                </Badge>
              </TableCell>

              <TableCell>{p.verified ? 'Yes' : 'No'}</TableCell>

              <TableCell>{createdAt}</TableCell>

              <TableCell className="text-right space-x-2">
                {p.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onApprove?.(p.id)}
                      disabled={loadingId === p.id}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onReject?.(p.id)}
                      disabled={loadingId === p.id}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {p.status === 'approved' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSuspend?.(p.id)}
                    disabled={loadingId === p.id}
                  >
                    Suspend
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
