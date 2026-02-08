import Link from 'next/link';
import { adminDb } from '@/lib/firebase-admin';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Workflow, Settings, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const db = adminDb;
  if (!db || typeof db.collection !== 'function') {
    return { providers: 0, pending: 0, jobs: 0, services: 0 };
  }

  try {
    const [providers, pending, jobs, services] = await Promise.all([
      db.collection('providers').count().get(),
      db.collection('providers').where('status', '==', 'pending').count().get(),
      db.collection('jobs').count().get(),
      db.collection('services').count().get()
    ]);

    return {
      providers: providers.data().count,
      pending: pending.data().count,
      jobs: jobs.data().count,
      services: services.data().count
    };
  } catch (e) {
    console.error("Dashboard data fetch error:", e);
    return { providers: 0, pending: 0, jobs: 0, services: 0 };
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const cards = [
    { title: 'Total Providers', value: data.providers, icon: Users, href: '/admin/providers', description: 'Manage all artisans nationwide', trend: '+12%' },
    { title: 'Pending Review', value: data.pending, icon: Clock, href: '/admin/providers?status=pending', description: 'Review new submissions', trend: 'New' },
    { title: 'Total Requests', value: data.jobs, icon: Workflow, href: '/admin/jobs', description: 'Monitor live service jobs', trend: '+5%' },
    { title: 'Services', value: data.services, icon: Settings, href: '/admin/services', description: 'Update categories and pricing', trend: 'Stable' },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-black font-headline text-foreground tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground text-lg mt-2 font-medium">Monitoring nationwide FixAm operations and artisan metrics.</p>
      </div>

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
                    {card.trend} <span className="ml-2 text-muted-foreground/60 font-medium">vs last month</span>
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