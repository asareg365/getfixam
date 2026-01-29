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
  console.log('Fetching providers with status:', status);
  // Fetch all services and create a map for efficient lookup.
  const servicesSnap = await adminDb.collection('services').get();
  const servicesMap = new Map<string, Omit<Service, 'icon'>>();
  servicesSnap.forEach(doc => {
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

  // Query providers, filtering by status if provided.
  let providersQuery = adminDb.collection('providers');
  if (status && status !== 'all') {
    providersQuery = providersQuery.where('status', '==', status);
  }

  const providerSnapshot = await providersQuery.orderBy('createdAt', 'desc').get();
  console.log('Providers fetched:', providerSnapshot.size);

  // Map provider data and enrich it with the service name (category).
  return providerSnapshot.docs.map((doc) => {
    const data = doc.data();
    const service = servicesMap.get(data.serviceId);

    return {
      id: doc.id,
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      location: data.location,
      status: data.status,
      verified: data.verified,
      isFeatured: data.isFeatured ?? false,
      rating: data.rating ?? 0,
      reviewCount: data.reviewCount ?? 0,
      imageId: data.imageId,
      serviceId: data.serviceId,
      category: service?.name ?? 'N/A',
      createdAt: data.createdAt
        ? data.createdAt.toDate().toISOString()
        : new Date(0).toISOString(),
      approvedAt: data.approvedAt?.toDate?.()?.toISOString(),
      featuredUntil: data.featuredUntil?.toDate?.()?.toISOString(),
    };
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
