import { getProviderById } from '@/lib/services';
import { notFound } from 'next/navigation';
import AddReviewForm from './form';
import PublicLayout from '@/components/layout/PublicLayout';

export const dynamic = "force-dynamic";

export default async function AddReviewPage({ params }: { params: { id: string } }) {
  const provider = await getProviderById(params.id);

  if (!provider) {
    notFound();
  }

  return (
    <PublicLayout>
        <AddReviewForm provider={provider} />
    </PublicLayout>
  );
}
