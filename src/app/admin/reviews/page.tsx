import { requireAdmin } from '@/lib/admin-guard';
import { admin } from '@/lib/firebase-admin';
import type { Review, Provider } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewsTable } from './_components/reviews-table';
import { ReviewTabs } from './_components/review-tabs';

export const dynamic = 'force-dynamic';

type ReviewWithProvider = Review & { providerName: string };

/** ----- Fetch Counts ----- */
async function getReviewCounts() {
  const statuses = ['pending', 'approved', 'rejected'];
  const counts: Record<string, number> = {};
  let total = 0;

  for (const status of statuses) {
    const snapshot = await admin.firestore().collection('reviews').where('status', '==', status).count().get();
    counts[status] = snapshot.data().count;
    total += counts[status];
  }
  counts['all'] = total;
  return counts;
}

/** ----- Fetch Reviews with Provider Names ----- */
async function getReviews(status?: string): Promise<ReviewWithProvider[]> {
  // 1. Fetch reviews
  let reviewsQuery: admin.firestore.Query = admin.firestore().collection('reviews');
  if (status && status !== 'all') {
    reviewsQuery = reviewsQuery.where('status', '==', status);
  }
  const reviewsSnap = await reviewsQuery.orderBy('createdAt', 'desc').get();
  
  const reviews: Review[] = reviewsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        providerId: data.providerId,
        userName: data.userName,
        rating: data.rating,
        comment: data.comment,
        userImageId: data.userImageId,
        status: data.status,
        createdAt: data.createdAt?.toDate().toISOString() ?? new Date(0).toISOString(),
        approvedAt: data.approvedAt?.toDate().toISOString(),
        approvedBy: data.approvedBy,
        rejectedAt: data.rejectedAt?.toDate().toISOString(),
        rejectedBy: data.rejectedBy,
      } as Review
  });
  
  if (reviews.length === 0) return [];

  // 2. Get unique provider IDs from reviews
  const providerIds = [...new Set(reviews.map(r => r.providerId))];

  // 3. Fetch corresponding providers
  const providersMap = new Map<string, string>();
  if (providerIds.length > 0) {
    // Firestore 'in' query is limited to 30 values.
    // For a more robust solution with many providers, this would need batching.
    const providersSnap = await admin.firestore().collection('providers').where(admin.firestore.FieldPath.documentId(), 'in', providerIds).get();
    providersSnap.forEach(doc => {
      providersMap.set(doc.id, doc.data().name ?? 'Unknown Provider');
    });
  }


  // 4. Join data
  return reviews.map(review => ({
    ...review,
    providerName: providersMap.get(review.providerId) || 'N/A',
  }));
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams?: { status?: 'pending' | 'approved' | 'rejected' | 'all' };
}) {
  await requireAdmin();

  const status = searchParams?.status || 'pending';
  const reviews = await getReviews(status);
  const counts = await getReviewCounts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Manage Reviews</h1>
          <p className="text-muted-foreground">Approve or reject user-submitted reviews.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Review Submissions</CardTitle>
          <CardDescription>
            Reviews from customers waiting for moderation.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ReviewTabs currentStatus={status} counts={counts} />
          <ReviewsTable reviews={reviews} />
        </CardContent>
      </Card>
    </div>
  );
}
