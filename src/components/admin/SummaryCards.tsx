'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

interface SummaryData {
  totalEscrowHeld: number;
  totalCommissionEarned: number;
  pendingPayouts: number;
  activeDisputes: number;
  completedJobsThisMonth: number;
}

// In a real app, this would come from your auth context/provider
const getAuthToken = () => {
    // This is a placeholder. Replace with your actual auth token retrieval logic.
    // For development, you might store a test token in localStorage.
    return localStorage.getItem('authToken');
};

export function SummaryCards() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication token not found.');
        }

        const response = await fetch('/api/admin/summary', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const summaryData: SummaryData = await response.json();
        setData(summaryData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <SummaryCardsSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 text-center col-span-5">Error: {error}</div>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
       <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Escrow Held</CardTitle>
              <span className="text-2xl">🇬🇭</span>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{`GHS ${data.totalEscrowHeld.toFixed(2)}`}</div>
              <p className="text-xs text-muted-foreground">Funds currently in the system</p>
          </CardContent>
      </Card>
      <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commission Earned</CardTitle>
              <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{`GHS ${data.totalCommissionEarned.toFixed(2)}`}</div>
              <p className="text-xs text-muted-foreground">Platform revenue from completed jobs</p>
          </CardContent>
      </Card>
      <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <span className="text-2xl">⏳</span>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{`GHS ${data.pendingPayouts.toFixed(2)}`}</div>
              <p className="text-xs text-muted-foreground">Awaiting release to providers</p>
          </CardContent>
      </Card>
      <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
              <span className="text-2xl">⚖️</span>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{data.activeDisputes}</div>
              <p className="text-xs text-muted-foreground">Engagements needing review</p>
          </CardContent>
      </Card>
      <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs (Month)</CardTitle>
              <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{data.completedJobsThisMonth}</div>
              <p className="text-xs text-muted-foreground">Jobs successfully completed this month</p>
          </CardContent>
      </Card>
    </div>
  );
}

function SummaryCardsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
            {[...Array(5)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
