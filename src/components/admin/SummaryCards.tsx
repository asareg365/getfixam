'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface SummaryData {
  totalEscrowHeld: number;
  totalCommissionEarned: number;
  pendingPayouts: number;
  activeDisputes: number;
  completedJobsThisMonth: number;
}

export function SummaryCards() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (token: string) => {
      try {
        const city = searchParams.get('city') || '';
        const url = `/api/admin/summary${city ? `?city=${city}` : ''}`;
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch summary: ${response.statusText}`);
        }

        const summaryData: SummaryData = await response.json();
        setData(summaryData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        fetchData(token);
      } else {
        const localToken = localStorage.getItem('authToken');
        if (localToken) fetchData(localToken);
        else {
          setError('Authentication session not found.');
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [searchParams]);

  if (loading) return <SummaryCardsSkeleton />;
  if (error) return <div className="text-red-500 text-center col-span-5 p-4 bg-red-50 rounded-xl mb-8 border border-red-100">{error}</div>;
  if (!data) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
       <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Escrow</CardTitle>
              <span className="text-xl">🇬🇭</span>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-black">{`₵${data.totalEscrowHeld.toLocaleString()}`}</div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Funds currently held</p>
          </CardContent>
      </Card>
      <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Net Revenue</CardTitle>
              <span className="text-xl">💰</span>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-black">{`₵${data.totalCommissionEarned.toLocaleString()}`}</div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Commissions earned</p>
          </CardContent>
      </Card>
      <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payouts Due</CardTitle>
              <span className="text-xl">⏳</span>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-black">{`₵${data.pendingPayouts.toLocaleString()}`}</div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Awaiting release</p>
          </CardContent>
      </Card>
      <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Disputes</CardTitle>
              <span className="text-xl">⚖️</span>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-black">{data.activeDisputes}</div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Needing review</p>
          </CardContent>
      </Card>
      <Card className="rounded-2xl border-none shadow-sm bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">Monthly Jobs</CardTitle>
              <span className="text-xl">📈</span>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-black text-primary">{data.completedJobsThisMonth}</div>
              <p className="text-[10px] text-primary/60 mt-1 font-medium">Completed in current month</p>
          </CardContent>
      </Card>
    </div>
  );
}

function SummaryCardsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
            {[...Array(5)].map((_, i) => (
                <Card key={i} className="rounded-2xl border-none shadow-sm">
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
