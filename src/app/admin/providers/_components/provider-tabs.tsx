'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface ProviderTabsProps {
  currentStatus: 'pending' | 'approved' | 'rejected' | 'suspended' | 'all';
}

const statuses: { label: string; value: ProviderTabsProps['currentStatus'] }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'All', value: 'all' },
];

export function ProviderTabs({ currentStatus }: ProviderTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getHref = (status: ProviderTabsProps['currentStatus']) => {
    const params = new URLSearchParams(searchParams.toString());
     if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    return `/admin/providers?${params.toString()}`;
  }

  return (
    <div className="flex gap-4 mb-4 overflow-x-auto">
      {statuses.map((status) => (
        <Link
          key={status.value}
          href={getHref(status.value)}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            currentStatus === status.value
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {status.label}
        </Link>
      ))}
    </div>
  );
}
