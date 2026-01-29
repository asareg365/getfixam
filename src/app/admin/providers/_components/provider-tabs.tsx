'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface ProviderTabsProps {
  currentStatus: 'pending' | 'approved' | 'rejected' | 'suspended' | 'all';
  counts: Record<string, number>;
}

const statuses: { label: string; value: ProviderTabsProps['currentStatus'] }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'All', value: 'all' },
];

export function ProviderTabs({ currentStatus, counts }: ProviderTabsProps) {
  const getHref = (status: ProviderTabsProps['currentStatus']) => {
    return `/admin/providers?status=${status}`;
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
