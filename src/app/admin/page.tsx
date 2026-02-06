'use client';

import { Users, UserCheck, MessageSquare, TrendingUp, ArrowUpRight } from 'lucide-react';

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
        <h1 className="text-3xl font-bold text-primary">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor platform activity in Berekum.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:border-primary/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
              <div className="p-2 rounded-lg bg-muted group-hover:scale-110 transition-transform">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="flex items-center mt-2 text-xs font-medium text-green-600">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              {stat.trend} <span className="ml-1 text-muted-foreground font-normal">from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white border rounded-2xl h-64 flex items-center justify-center italic text-muted-foreground">
          Analytics chart placeholder
        </div>
        <div className="bg-white border rounded-2xl h-64 flex items-center justify-center italic text-muted-foreground">
          Recent activity placeholder
        </div>
      </div>
    </div>
  );
}