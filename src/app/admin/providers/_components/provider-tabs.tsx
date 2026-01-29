'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const [active, setActive] = useState(currentStatus);

  const handleTabClick = (status: ProviderTabsProps['currentStatus']) => {
    setActive(status);
    const params = new URLSearchParams(searchParams.toString());
    params.set('status', status);
    router.replace(`/admin/providers?${params.toString()}`);
  };

  return (
    <div className="flex gap-4 mb-4 overflow-x-auto">
      {statuses.map((status) => (
        <button
          key={status.value}
          className={`px-4 py-2 rounded-md font-medium ${
            active === status.value ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
          }`}
          onClick={() => handleTabClick(status.value)}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
}
