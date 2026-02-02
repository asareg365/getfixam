import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardData } from '@/lib/services';
import { DashboardCharts } from './_components/dashboard-charts';
import { HeatmapList } from './_components/heatmap-list';
import { PredictionCard } from './_components/prediction-card';
import { StandbyCard } from './_components/standby-card';
import { requireAdmin } from '@/lib/admin-guard';
import { adminDb } from '@/lib/firebase-admin';
import { FieldPath } from 'firebase-admin/firestore';
import type { Provider, StandbyPrediction } from '@/lib/types';


export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await requireAdmin();

  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
              <CardHeader><CardTitle>Total Providers</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{data.totalProviders}</p></CardContent>
          </Card>
           <Card>
              <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{data.pendingProviders}</p></CardContent>
          </Card>
           <Card>
              <CardHeader><CardTitle>Total Requests</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{data.totalRequests}</p></CardContent>
          </Card>
           <Card>
              <CardHeader><CardTitle>Services</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{data.activeServices}</p></CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <DashboardCharts serviceData={data.serviceChartData} locationData={data.locationChartData} />
        </div>
        <div className="lg:col-span-1 space-y-6">
            <HeatmapList data={data.locationChartData} />
        </div>
      </div>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PredictionCard prediction={data.prediction} />
          <StandbyCard standby={data.standby} />
      </div>
    </div>
  );
}
