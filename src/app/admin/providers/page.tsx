'use server';

import { requireAdmin } from '@/lib/admin-guard';
import { adminDb } from '@/lib/firebase-admin';
import type { Provider, Service } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { ProviderTabs } from './_components/provider-tabs';
import { ProvidersTable } from './_components/providers-table';
import { approveProvider, rejectProvider, suspendProvider } from '@/app/admin/actions';

/** ----- Fetch Providers with safe defaults ----- */
async function getProvidersFromDB(status?: string): Promise<Provider[]> {
  // Fetch all services and map them
  const servicesSnap = await adminDb.collection('services').get();
  const servicesMap = new Map<string, Omit<Service, 'icon'>>();
  servicesSnap.forEach((doc) => {
    const data = doc.data();
    servicesMap.set(doc.id, {
      id: doc.id,
      name: data.name ?? 'Unknown',
      slug: data.slug ?? '',
      active: data.active ?? false,
      basePrice: data.basePrice ?? 0,
      currency: data.currency ?? 'GHS',
    });
  });

  // Query providers
  let providersQuery = adminDb.collection('providers').orderBy('createdAt', 'desc');
  if (status && status !== 'all') {
    providersQuery = adminDb.collection('providers').where('status', '==', status).orderBy('createdAt', 'desc');
  }
  const providerSnapshot = await providersQuery.get();

  return providerSnapshot.docs.map((doc) => {
    const data = doc.data();
    const service = servicesMap.get(data.serviceId);
    return {
      id: doc.id,
      name: data.name ?? 'Unknown',
      phone: data.phone ?? '',
      whatsapp: data.whatsapp ?? '',
      location: data.location ?? { region: '', city: '', zone: ''},
      status: data.status ?? 'pending',
      verified: data.verified ?? false,
      isFeatured: data.isFeatured ?? false,
      rating: data.rating ?? 0,
      reviewCount: data.reviewCount ?? 0,
      imageId: data.imageId ?? '',
      serviceId: data.serviceId ?? '',
      category: service?.name ?? 'N/A',
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date(0).toISOString(),
      approvedAt: data.approvedAt ? data.approvedAt.toDate().toISOString() : undefined,
      featuredUntil: data.featuredUntil ? data.featuredUntil.toDate().toISOString() : undefined,
    };
  });
}

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams?: { status?: 'pending' | 'approved' | 'rejected' | 'suspended' | 'all' };
}) {
  await requireAdmin();

  const status = searchParams?.status || 'pending';
  const providers = await getProvidersFromDB(status);

  async function handleAction(providerId: string, action: 'approve' | 'reject' | 'suspend'): Promise<{ success: boolean; error?: string; }> {
    'use server';
    const formData = new FormData();
    formData.set('providerId', providerId);

    switch(action) {
        case 'approve':
            return await approveProvider({}, formData);
        case 'reject':
            return await rejectProvider({}, formData);
        case 'suspend':
            return await suspendProvider({}, formData);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Manage Providers</h1>
          <p className="text-muted-foreground">Approve, edit, or suspend artisan listings.</p>
        </div>
        <Button asChild>
          <Link href="/add-provider">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Provider
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Provider List</CardTitle>
          <CardDescription>
            A list of providers in the system, filterable by status.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ProviderTabs currentStatus={status} />
          <ProvidersTable providers={providers} onAction={handleAction} />
        </CardContent>
      </Card>
    </div>
  );
}
