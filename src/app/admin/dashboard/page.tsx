'use server';

import { requireAdmin } from '@/lib/admin-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, List, CheckCircle, Package, MessageSquare, AlertCircle } from 'lucide-react';
import { getDashboardData } from '@/lib/services';
import { DashboardCharts } from './_components/dashboard-charts';
import { HeatmapList } from './_components/heatmap-list';
import { PredictionCard } from './_components/prediction-card';
import { StandbyCard } from './_components/standby-card';

type StatCardProps = {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
}

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  await requireAdmin();
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
            title="Total Providers" 
            value={data.totalProviders}
            description="Currently listed artisans"
            icon={Users}
        />
        <StatCard 
            title="Pending Approvals" 
            value={data.pendingProviders}
            description="New submissions to review"
            icon={List}
        />
        <StatCard 
            title="Active Services" 
            value={data.activeServices}
            description="Categories available"
            icon={CheckCircle}
        />
         <StatCard 
            title="Total Requests" 
            value={data.totalRequests}
            description="From WhatsApp and other channels"
            icon={Package}
        />
        <StatCard 
            title="WhatsApp Messages" 
            value={data.whatsappMessages}
            description="Total messages from bot"
            icon={MessageSquare}
        />
        <StatCard 
            title="Failed Messages" 
            value={data.failedMessages}
            description="Unrecognized bot commands"
            icon={AlertCircle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <PredictionCard prediction={data.prediction} />
                <StandbyCard standby={data.standby} />
            </div>
            <DashboardCharts 
                serviceData={data.serviceChartData}
                locationData={data.locationChartData}
            />
        </div>
        <div className="lg:col-span-1">
             <HeatmapList data={data.locationChartData} />
        </div>
      </div>
    </div>
  );
}
