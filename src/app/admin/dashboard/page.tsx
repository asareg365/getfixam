import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCharts } from './_components/dashboard-charts';
import { HeatmapList } from './_components/heatmap-list';
import { PredictionCard } from './_components/prediction-card';
import { StandbyCard } from './_components/standby-card';
import { requireAdmin } from '@/lib/admin-guard';
import { adminDb } from '@/lib/firebase-admin';
import { FieldPath } from 'firebase-admin/firestore';
import type { Provider, Prediction, StandbyPrediction, Request } from '@/lib/types';
import { REQUESTS } from '@/lib/data';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
    try {
        // Fetch live counts for the stat cards
        const [
            providersSnap,
            pendingProvidersSnap,
            requestsSnap,
            activeServicesSnap
        ] = await Promise.all([
            adminDb.collection('providers').count().get(),
            adminDb.collection('providers').where('status', '==', 'pending').count().get(),
            adminDb.collection('requests').count().get(),
            adminDb.collection('services').where('active', '==', true).count().get()
        ]);

        const totalProviders = providersSnap.data().count;
        const pendingProviders = pendingProvidersSnap.data().count;
        const totalRequests = requestsSnap.data().count;
        const activeServices = activeServicesSnap.data().count;
        
        // Fetch live standby and prediction data
        const predictionDoc = await adminDb.collection('predictions').doc('tomorrow').get();
        const predictionData = predictionDoc.data();
        const prediction: Prediction | null = predictionDoc.exists && predictionData ? { 
            ...predictionData, 
            generatedAt: predictionData.generatedAt.toDate().toISOString() 
        } as Prediction : null;

        const standbyDoc = await adminDb.collection('standby').doc('tomorrow').get();
        let standby: StandbyPrediction | null = null;
        if (standbyDoc.exists) {
            const standbyData = standbyDoc.data()!;
            const artisanIds = (standbyData.artisans || []) as string[];
            let standbyArtisans: Provider[] = [];

            if (artisanIds.length > 0) {
                 // Fetch provider details in a single query
                const providersSnap = await adminDb.collection('providers').where(FieldPath.documentId(), 'in', artisanIds).get();
                const providersMap = new Map<string, Provider>();
                providersSnap.forEach(doc => {
                    const data = doc.data();
                    providersMap.set(doc.id, {
                        id: doc.id,
                        name: data.name ?? 'Unknown',
                        phone: data.phone ?? '',
                    } as Provider);
                });
                standbyArtisans = artisanIds.map(id => providersMap.get(id)).filter(Boolean) as Provider[];
            }

            standby = {
                serviceType: standbyData.serviceType,
                area: standbyData.area,
                artisans: standbyArtisans,
                generatedAt: standbyData.generatedAt.toDate().toISOString(),
            };
        }

        // Keep using mock data for charts and other stats for now
        const whatsappMessages = 250; // Mock value
        const failedMessages = 15; // Mock value

        const serviceCounts = REQUESTS.reduce((acc, req) => {
            acc[req.serviceType] = (acc[req.serviceType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const locationCounts = REQUESTS.reduce((acc, req) => {
            acc[req.location] = (acc[req.location] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const serviceChartData = Object.entries(serviceCounts).map(([name, total]) => ({ name, total }));
        const locationChartData = Object.entries(locationCounts).map(([name, total]) => ({ name, total }));

        return {
            totalProviders,
            pendingProviders,
            activeServices,
            totalRequests,
            whatsappMessages,
            failedMessages,
            serviceChartData,
            locationChartData,
            prediction,
            standby,
        };
    } catch (error) {
        console.error('CRITICAL: Could not generate dashboard data.', error);
        // Fallback to all zeros if Firestore fails
        return {
            totalProviders: 0,
            pendingProviders: 0,
            activeServices: 0,
            totalRequests: 0,
            whatsappMessages: 0,
            failedMessages: 0,
            serviceChartData: [],
            locationChartData: [],
            prediction: null,
            standby: null,
        };
    }
}


export default async function AdminDashboard() {
  await requireAdmin();

  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/providers?status=all">
            <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader><CardTitle>Total Providers</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{data.totalProviders}</p></CardContent>
            </Card>
          </Link>
          <Link href="/admin/providers?status=pending">
            <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{data.pendingProviders}</p></CardContent>
            </Card>
          </Link>
          <Link href="/admin/jobs">
            <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader><CardTitle>Total Requests</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{data.totalRequests}</p></CardContent>
            </Card>
          </Link>
          <Link href="/admin/services">
            <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader><CardTitle>Services</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{data.activeServices}</p></CardContent>
            </Card>
          </Link>
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
