'use client';

import { Users, UserCheck, MessageSquare, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Artisans', value: '128', icon: Users, trend: '+12%', description: 'Active listings' },
    { title: 'Verified Pros', value: '94', icon: UserCheck, trend: '73%', description: 'Verification rate' },
    { title: 'Bot Requests', value: '452', icon: MessageSquare, trend: '+18%', description: 'Last 24 hours' },
    { title: 'Platform Growth', value: '+22%', icon: TrendingUp, trend: 'Overall', description: 'Month over month' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Overview</h1>
        <p className="text-muted-foreground">Real-time performance metrics for FixAm Ghana.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                {stat.trend} <ArrowUpRight className="ml-1 h-3 w-3" />
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Placeholder for Analytics Charts */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm h-80 flex flex-col">
          <h3 className="font-bold text-lg mb-4">Artisan Registration Trend</h3>
          <div className="flex-1 bg-muted/20 rounded-xl border-2 border-dashed flex items-center justify-center text-muted-foreground">
            Chart Placeholder
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm h-80 flex flex-col">
          <h3 className="font-bold text-lg mb-4">Requests by Category</h3>
          <div className="flex-1 bg-muted/20 rounded-xl border-2 border-dashed flex items-center justify-center text-muted-foreground">
            Pie Chart Placeholder
          </div>
        </div>
      </div>
    </div>
  );
}