'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Provider } from '@/lib/types';

interface ProvidersTableProps {
  providers: Provider[];
}

export function ProvidersTable({ providers }: ProvidersTableProps) {
  if (!providers || providers.length === 0) {
    return <p className="text-center py-6 text-muted-foreground">No providers found.</p>;
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
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providers.map((p) => (
          <TableRow key={p.id}>
            <TableCell>{p.name ?? 'Unknown'}</TableCell>
            <TableCell>{p.phone ?? '-'}</TableCell>
            <TableCell>{p.category ?? 'N/A'}</TableCell>
            <TableCell>{p.status ?? 'pending'}</TableCell>
            <TableCell>{p.verified ? 'Yes' : 'No'}</TableCell>
            <TableCell>{p.createdAt ?? new Date(0).toISOString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
