import { requireAdmin } from '@/lib/admin-guard';
import { adminDb } from '@/lib/firebase-admin';
import type { Provider } from '@/lib/types';
import { ProvidersTable } from './_components/providers-table';
import { ProviderTabs } from './_components/provider-tabs';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

async function getProvidersData(status: string) {
  const db = adminDb;
  if (!db || typeof db.collection !== 'function') return { providers: [], counts: {} };

  try {
    const servicesSnap = await db.collection('services').get();
    const servicesMap = new Map();
    servicesSnap.forEach(doc => servicesMap.set(doc.id, doc.data().name));

    let query = db.collection('providers');
    if (status !== 'all') {
      query = query.where('status', '==', status) as any;
    }
    
    const providersSnap = await query.orderBy('createdAt', 'desc').get();
    const providers = providersSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        category: servicesMap.get(data.serviceId) || 'N/A',
        createdAt: data.createdAt?.toDate()?.toISOString(),
        approvedAt: data.approvedAt?.toDate()?.toISOString(),
        rejectedAt: data.rejectedAt?.toDate()?.toISOString(),
        suspendedAt: data.suspendedAt?.toDate()?.toISOString(),
      } as Provider;
    });

    const statusCounts: Record<string, number> = {};
    const statuses = ['pending', 'approved', 'rejected', 'suspended'];
    
    for (const s of statuses) {
      const snap = await db.collection('providers').where('status', '==', s).count().get();
      statusCounts[s] = snap.data().count;
    }
    const allSnap = await db.collection('providers').count().get();
    statusCounts['all'] = allSnap.data().count;

    return { providers, counts: statusCounts };
  } catch (e) {
    console.error("Error fetching providers:", e);
    return { providers: [], counts: {} };
  }
}

export default async function ProvidersPage(props: PageProps) {
  const searchParams = await props.searchParams;
  await requireAdmin();
  
  const currentStatus = (searchParams.status as any) || 'pending';
  const { providers, counts } = await getProvidersData(currentStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Artisan Providers</h1>
        <p className="text-muted-foreground">Review and manage artisan listings in Berekum.</p>
      </div>

      <ProviderTabs currentStatus={currentStatus} counts={counts} />
      <ProvidersTable providers={providers} />
    </div>
  );
}
