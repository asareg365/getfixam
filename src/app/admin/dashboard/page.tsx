import Link from 'next/link';
import { adminDb } from '@/lib/firebase-admin';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Workflow, Settings } from 'lucide-react';

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
    { title: 'Total Providers', value: data.providers, icon: Users, href: '/admin/providers', description: 'Manage all artisans' },
    { title: 'Pending Review', value: data.pending, icon: Clock, href: '/admin/providers?status=pending', description: 'Review new submissions' },
    { title: 'Total Requests', value: data.jobs, icon: Workflow, href: '/admin/jobs', description: 'Monitor live service jobs' },
    { title: 'Services', value: data.services, icon: Settings, href: '/admin/services', description: 'Update categories and pricing' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Real-time overview of FixAm Ghana operations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="block transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Card className="h-full border-primary/20 hover:border-primary shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
