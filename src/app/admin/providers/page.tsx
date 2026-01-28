import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { adminDb } from '@/lib/firebase-admin';
import type { Provider, Service } from '@/lib/types';
import Link from 'next/link';
import { ProvidersTable } from './_components/providers-table';
import { ProviderTabs } from './_components/provider-tabs';

async function getProvidersFromDB(status?: string): Promise<Provider[]> {
  let providersQuery = adminDb.collection('providers');
  if (status && status !== 'all') {
    providersQuery = providersQuery.where('status', '==', status);
  }

  const providerSnapshot = await providersQuery.orderBy('createdAt', 'desc').get();

  if (providerSnapshot.empty) {
    return [];
  }

  const serviceIds = [
    ...new Set(providerSnapshot.docs.map((doc) => doc.data().serviceId)),
  ].filter(Boolean);
  
  let services: Omit<Service, 'icon'>[] = [];
  if (serviceIds.length > 0) {
      const serviceSnapshot = await adminDb.collection('services').where('__name__', 'in', serviceIds).get();
      services = serviceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Omit<Service, 'icon'>));
  }

  return providerSnapshot.docs.map((doc) => {
    const data = doc.data();
    const service = services.find(s => s.id === data.serviceId);
    const providerData: Provider = {
      id: doc.id,
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      location: data.location,
      status: data.status,
      verified: data.verified,
      isFeatured: data.isFeatured || false,
      rating: data.rating,
      reviewCount: data.reviewCount,
      imageId: data.imageId,
      serviceId: data.serviceId,
      category: service?.name || data.serviceId || 'N/A',
      createdAt: data.createdAt.toDate().toISOString(),
    };
     if (data.approvedAt) {
      providerData.approvedAt = data.approvedAt.toDate().toISOString();
    }
    if (data.featuredUntil) {
      providerData.featuredUntil = data.featuredUntil.toDate().toISOString();
    }
    return providerData;
  });
}

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams?: { status?: 'pending' | 'approved' | 'rejected' | 'suspended' | 'all' };
}) {
  const status = searchParams?.status || 'pending';
  const providers = await getProvidersFromDB(status);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Manage Providers</h1>
          <p className="text-muted-foreground">
            Approve, edit, or suspend artisan listings.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/providers/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Provider
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle>Provider List</CardTitle>
          <CardDescription>
            A list of providers in the system, filterable by status.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <ProviderTabs currentStatus={status}/>
            <ProvidersTable providers={providers} />
        </CardContent>
      </Card>
    </div>
  );
}
