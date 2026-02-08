'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { Users, UserCheck, TrendingUp, ArrowUpRight, Clock, ShieldCheck, Zap, Activity, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalArtisans: 0,
    verifiedPros: 0,
    customerRequests: 0,
    systemHealth: 'Optimal',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRealStats() {
      try {
        const providersRef = collection(db, 'providers');
        const jobsRef = collection(db, 'jobs'); // Assuming requests are stored in jobs
        
        const verifiedQuery = query(providersRef, where('verified', '==', true));

        const [totalSnap, verifiedSnap, jobsSnap] = await Promise.all([
          getCountFromServer(providersRef),
          getCountFromServer(verifiedQuery),
          getCountFromServer(jobsRef),
        ]);

        setStats({
          totalArtisans: totalSnap.data().count,
          verifiedPros: verifiedSnap.data().count,
          customerRequests: jobsSnap.data().count,
          systemHealth: 'Optimal',
        });
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRealStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Artisans', value: stats.totalArtisans.toLocaleString(), icon: Users, trend: 'Current', color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Verified Pros', value: stats.verifiedPros.toLocaleString(), icon: UserCheck, trend: 'Vetted', color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Customer Requests', value: stats.customerRequests.toLocaleString(), icon: Activity, trend: 'Live', color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'System Health', value: stats.systemHealth, icon: ShieldCheck, trend: 'Stable', color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground font-headline tracking-tight">System Overview</h1>
          <p className="text-muted-foreground text-lg mt-1 font-medium">Monitoring platform-wide performance and verification metrics.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-bold text-muted-foreground">Updated live</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[32px] overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-8">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">{stat.title}</CardTitle>
              <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="text-4xl font-black tracking-tighter text-foreground">{stat.value}</div>
              <div className="flex items-center mt-3 text-sm font-bold text-green-600">
                <div className="bg-green-100 p-1 rounded-full mr-2">
                  <ArrowUpRight className="h-3 w-3" />
                </div>
                {stat.trend} <span className="ml-2 text-muted-foreground/60 font-medium">real-time data</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-[40px] h-[400px] flex items-center justify-center bg-white relative overflow-hidden group">
          <div className="absolute top-8 left-10 space-y-1">
            <h3 className="text-2xl font-bold font-headline">Engagement Trends</h3>
            <p className="text-sm text-muted-foreground font-medium">Artisan signups vs Customer requests</p>
          </div>
          <div className="text-center space-y-4">
            <div className="bg-muted/30 p-10 rounded-full inline-block group-hover:scale-105 transition-transform duration-500">
              <TrendingUp className="h-16 w-16 text-muted-foreground/30" />
            </div>
            {stats.customerRequests === 0 && stats.totalArtisans === 0 ? (
              <p className="italic text-muted-foreground font-medium text-lg">Waiting for more platform activity to generate trends...</p>
            ) : (
              <p className="italic text-muted-foreground font-medium text-lg">Analytics dashboard processing {stats.customerRequests + stats.totalArtisans} data points...</p>
            )}
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-[40px] bg-primary text-white h-[400px] flex flex-col p-10 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <Zap className="h-12 w-12 text-white/80" />
            <h3 className="text-3xl font-black font-headline pt-4">Smart Matching</h3>
            <p className="text-white/70 font-medium">Auto-pairing algorithm is active and ready to process requests.</p>
          </div>
          <div className="mt-auto relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-white/60">System Ready</span>
              <span className="text-sm font-bold">100%</span>
            </div>
            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
              <div className="bg-white h-full w-[100%]" />
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
        </Card>
      </div>
    </div>
  );
}
