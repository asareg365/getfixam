import { getProviderById } from '@/lib/services';
import { notFound } from 'next/navigation';
import AddReviewForm from './form';

export default async function AddReviewPage({ params }: { params: { id: string } }) {
  const provider = await getProviderById(params.id);

  if (!provider) {
    notFound();
  }

  return <AddReviewForm provider={provider} />;
}
