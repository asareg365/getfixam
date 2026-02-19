'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';

export type EngagementColumn = {
  id: string;
  name: string;
  phone: string;
  message: string;
  type: 'REQUEST' | 'COMPLAINT' | 'FOLLOW_UP';
  status: 'new' | 'read' | 'archived';
  createdAt: Date;
};

export const columns: ColumnDef<EngagementColumn>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row }) => <div className="line-clamp-2">{row.original.message}</div>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => <Badge>{row.original.type}</Badge>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const variant = row.original.status === 'new' ? 'destructive' : 'outline';
      return <Badge variant={variant}>{row.original.status}</Badge>;
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
