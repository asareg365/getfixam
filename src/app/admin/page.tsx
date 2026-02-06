import { Users, UserCheck, MessageSquare, TrendingUp, ArrowUpRight, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Artisans', value: '128', icon: Users, trend: '+12%', color: 'text-primary' },
    { title: 'Verified Pros', value: '94', icon: UserCheck, trend: '73%', color: 'text-green-600' },
    { title: 'Bot Requests', value: '452', icon: MessageSquare, trend: '+18%', color: 'text-blue-600' },
    { title: 'Success Rate', value: '92%', icon: TrendingUp, trend: '+5%', color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground font-headline">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor provider performance and platform activity in Berekum.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-muted group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-1 text-xs font-medium text-green-600">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                {stat.trend} <span className="ml-1 text-muted-foreground font-normal">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>Live updates from the WhatsApp matching bot.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Job Request: Electrician</p>
                    <p className="text-xs text-muted-foreground">New request received from Biadan area.</p>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> {i * 5}m ago
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Security Logs</CardTitle>
            <CardDescription>Recent administrative actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="bg-secondary/10 p-2 rounded-full mt-1">
                    <Shield className="h-4 w-4 text-secondary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Provider Verified</p>
                    <p className="text-[10px] text-muted-foreground">Admin verified Kwame Electric Works</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
