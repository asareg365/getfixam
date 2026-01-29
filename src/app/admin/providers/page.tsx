
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import type { Provider, Service } from '@/lib/types';
import { ProvidersTable } from './_components/providers-table';
import { ProviderTabs } from './_components/provider-tabs';

/** ----- Helper: Check Admin Session ----- */
async function checkAdminSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('adminSession')?.value;

  if (!token) {
    redirect('/admin/login'); // No session → go to login
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.email?.toLowerCase() !== 'asareg365@gmail.com') {
      redirect('/admin/login'); // Wrong user → go to login
    }
  } catch (err) {
    console.error('Admin verification failed', err);
    redirect('/admin/login'); // Invalid token → go to login
  }
}

/** ----- Fetch Providers from Firestore ----- */
async function getProvidersFromDB(status?: string): Promise<Provider[]> {
  // Fetch services first
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

  // Build providers query
  let providersQuery = adminDb.collection('providers');
  if (status && status !== 'all') {
    providersQuery = providersQuery.where('status', '==', status);
  }

  const providerSnapshot = await providersQuery.orderBy('createdAt', 'desc').get();

  return providerSnapshot.docs.map(doc => {
    const data = doc.data();
    const service = servicesMap.get(data.serviceId);

    return {
      id: doc.id,
      name: data.name ?? 'Unknown',
      phone: data.phone ?? '',
      whatsapp: data.whatsapp ?? '',
      location: data.location ?? { region: '', city: '', zone: '' },
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

/** ----- Main Providers Page ----- */
export default async function ProvidersPage({
  searchParams,
}: {
  searchParams?: { status?: 'pending' | 'approved' | 'rejected' | 'suspended' | 'all' };
}) {
  // ✅ 1. Ensure admin is logged in
  await checkAdminSession();

  // ✅ 2. Fetch providers safely
  const status = searchParams?.status || 'pending';
  const providers = await getProvidersFromDB(status);

  // ✅ 3. Render page
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
        <CardHeader className="pb-2">
          <CardTitle>Provider List</CardTitle>
          <CardDescription>
            A list of providers in the system, filterable by status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderTabs currentStatus={status} />
          <ProvidersTable providers={providers} />
        </CardContent>
      </Card>
    </div>
  );
}
