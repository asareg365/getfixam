'use client';

import { Users, UserCheck, MessageSquare, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Artisans', value: '128', icon: Users, trend: '+12%', color: 'text-primary' },
    { title: 'Verified Pros', value: '94', icon: UserCheck, trend: '73%', color: 'text-green-600' },
    { title: 'Bot Requests', value: '452', icon: MessageSquare, trend: '+18%', color: 'text-blue-600' },
    { title: 'Success Rate', value: '92%', icon: TrendingUp, trend: '+5%', color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-primary font-headline">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor platform activity and growth metrics.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-transparent shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className="p-2 rounded-lg bg-muted">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-2 text-xs font-medium text-green-600">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                {stat.trend} <span className="ml-1 text-muted-foreground font-normal">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-80 flex items-center justify-center border-dashed">
          <div className="text-center">
            <TrendingUp className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="italic text-muted-foreground">Growth analytics will appear here.</p>
          </div>
        </Card>
        <Card className="h-80 flex items-center justify-center border-dashed">
          <div className="text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="italic text-muted-foreground">Recent activity logs will appear here.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}