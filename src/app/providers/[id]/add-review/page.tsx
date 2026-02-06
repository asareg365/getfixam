import { getProviderById } from '@/lib/services';
import { notFound } from 'next/navigation';
import AddReviewForm from './form';
import PublicLayout from '@/components/layout/PublicLayout';

export const dynamic = "force-dynamic";

export default async function AddReviewPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
