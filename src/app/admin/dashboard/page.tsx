'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Workflow, Settings, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ providers: 0, pending: 0, jobs: 0, services: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const providersRef = collection(db, 'providers');
        const jobsRef = collection(db, 'jobs');
        const servicesRef = collection(db, 'services');
        const pendingQuery = query(providersRef, where('status', '==', 'pending'));

        // We fetch these individually to avoid one failure blocking all stats
        const results = await Promise.allSettled([
          getCountFromServer(providersRef),
          getCountFromServer(pendingQuery),
          getCountFromServer(jobsRef),
          getCountFromServer(servicesRef)
        ]);

        const getVal = (res: PromiseSettledResult<any>) => 
          res.status === 'fulfilled' ? res.value.data().count : 0;

        setStats({
          providers: getVal(results[0]),
          pending: getVal(results[1]),
          jobs: getVal(results[2]),
          services: getVal(results[3])
        });

        // Check if any critical fetch failed due to permissions
        const permissionError = results.find(r => r.status === 'rejected' && r.reason?.code === 'permission-denied');
        if (permissionError) {
            setError("Some data could not be loaded due to permission restrictions. Ensure your admin account is properly initialized.");
        }

      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err);
        setError(err.message || "Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Providers', value: stats.providers, icon: Users, href: '/admin/providers', description: 'Manage all artisans nationwide', trend: '+12%' },
    { title: 'Pending Review', value: stats.pending, icon: Clock, href: '/admin/providers?status=pending', description: 'Review new submissions', trend: 'New' },
    { title: 'Total Requests', value: stats.jobs, icon: Workflow, href: '/admin/jobs', description: 'Monitor live service jobs', trend: '+5%' },
    { title: 'Services', value: stats.services, icon: Settings, href: '/admin/services', description: 'Update categories and pricing', trend: 'Stable' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground font-medium">Syncing system data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-4xl font-black font-headline text-foreground tracking-tight">Platform Overview</h1>
            <p className="text-muted-foreground text-lg mt-2 font-medium">Monitoring nationwide FixAm operations and artisan metrics.</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-2xl border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>System Notice</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="group">
            <Card className="h-full border-none shadow-sm hover:shadow-2xl transition-all duration-300 rounded-[32px] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">{card.title}</CardTitle>
                <div className="bg-primary/10 p-3 rounded-2xl transition-transform group-hover:scale-110">
                    <card.icon className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="text-4xl font-black tracking-tighter text-foreground">{card.value}</div>
                <div className="flex items-center mt-4 text-sm font-bold text-green-600">
                    <div className="bg-green-100 p-1 rounded-full mr-2">
                        <ArrowUpRight className="h-3 w-3" />
                    </div>
                    {card.trend} <span className="ml-2 text-muted-foreground/60 font-medium">real-time</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4 font-medium">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}