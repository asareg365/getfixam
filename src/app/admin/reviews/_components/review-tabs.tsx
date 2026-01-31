'use client';

import Link from 'next/link';
import type { Review } from '@/lib/types';

interface ReviewTabsProps {
  currentStatus: 'pending' | 'approved' | 'rejected' | 'all';
  counts: Record<string, number>;
}

const statuses: { label: string; value: ReviewTabsProps['currentStatus'] }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' },
];

export function ReviewTabs({ currentStatus, counts }: ReviewTabsProps) {
  const getHref = (status: ReviewTabsProps['currentStatus']) => {
    return `/admin/reviews?status=${status}`;
  }

  return (
    <div className="flex gap-4 mb-4 overflow-x-auto">
      {statuses.map((status) => (
        <Link
          key={status.value}
          href={getHref(status.value)}
          className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            currentStatus === status.value
              ? 'bg-primary text-white shadow'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {status.label} <span className="ml-1.5 rounded-full bg-primary/20 px-2 text-xs">{counts[status.value] ?? 0}</span>
        </Link>
      ))}
    </div>
  );
}
