import { requireAdmin } from '@/lib/admin-guard';
import { adminDb } from '@/lib/firebase-admin';
import type { Review } from '@/lib/types';
import { ReviewsTable } from './_components/reviews-table';
import { ReviewTabs } from './_components/review-tabs';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

async function getReviewsData(status: string) {
  const db = adminDb;
  if (!db || typeof db.collection !== 'function') return { reviews: [], counts: {} };

  try {
    const providersSnap = await db.collection('providers').get();
    const providersMap = new Map();
    providersSnap.forEach(doc => providersMap.set(doc.id, doc.data().name));

    let query = db.collection('reviews');
    if (status !== 'all') {
      query = query.where('status', '==', status) as any;
    }
    
    const reviewsSnap = await query.orderBy('createdAt', 'desc').get();
    const reviews = reviewsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        providerName: providersMap.get(data.providerId) || 'Unknown Provider',
        createdAt: data.createdAt?.toDate()?.toISOString(),
      } as (Review & { providerName: string });
    });

    const statusCounts: Record<string, number> = {};
    const statuses = ['pending', 'approved', 'rejected'];
    
    for (const s of statuses) {
      const snap = await db.collection('reviews').where('status', '==', s).count().get();
      statusCounts[s] = snap.data().count;
    }
    const allSnap = await db.collection('reviews').count().get();
    statusCounts['all'] = allSnap.data().count;

    return { reviews, counts: statusCounts };
  } catch (e) {
    console.error("Error fetching reviews:", e);
    return { reviews: [], counts: {} };
  }
}

export default async function ReviewsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  await requireAdmin();
  
  const currentStatus = (searchParams.status as any) || 'pending';
  const { reviews, counts } = await getReviewsData(currentStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Customer Reviews</h1>
        <p className="text-muted-foreground">Moderate and manage reviews submitted by customers.</p>
      </div>

      <ReviewTabs currentStatus={currentStatus} counts={counts} />
      <ReviewsTable reviews={reviews} />
    </div>
  );
}
