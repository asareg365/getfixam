
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, type DocumentData } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { revalidatePath } from 'next/cache';
import { logAdminAction } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  const action = params.action;
  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  }

  try {
    const adminUser = await requireAdmin();
    const { reviewId } = await req.json();

    if (!reviewId) {
      return NextResponse.json({ success: false, error: 'Review ID missing' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const reviewRef = adminDb.collection('reviews').doc(reviewId);
    
    if (action === 'approve') {
      await adminDb.runTransaction(async (transaction) => {
        const reviewSnap = await transaction.get(reviewRef);
        if (!reviewSnap.exists) throw new Error('Review not found.');
        
        const reviewData = reviewSnap.data()!;
        if (reviewData.status === 'approved') return;

        const providerRef = adminDb.collection('providers').doc(reviewData.providerId);
        const providerSnap = await transaction.get(providerRef);
        if (!providerSnap.exists) throw new Error('Associated provider not found.');

        const providerData = providerSnap.data()!;
        const currentRating = providerData.rating || 0;
        const currentReviewCount = providerData.reviewCount || 0;
        const newReviewCount = currentReviewCount + 1;
        const newRating = ((currentRating * currentReviewCount) + reviewData.rating) / newReviewCount;

        transaction.update(providerRef, {
          rating: newRating,
          reviewCount: newReviewCount
        });

        transaction.update(reviewRef, {
          status: 'approved',
          approvedAt: FieldValue.serverTimestamp(),
          approvedBy: adminUser.email,
        });
      });

      // Log action after transaction commits
      await logAdminAction({
        adminEmail: adminUser.email!,
        action: 'REVIEW_APPROVED',
        targetType: 'review',
        targetId: reviewId,
        ipAddress,
        userAgent,
      });

    } else if (action === 'reject') {
      const reviewSnap = await reviewRef.get();
      if (!reviewSnap.exists) throw new Error('Review not found.');
      const reviewData = reviewSnap.data()!;

      if (reviewData.status !== 'pending') {
        return NextResponse.json({ success: true, message: 'Review was not in pending state.' });
      }
      
      await reviewRef.update({
        status: 'rejected',
        rejectedAt: FieldValue.serverTimestamp(),
        rejectedBy: adminUser.email,
      });

      await logAdminAction({
        adminEmail: adminUser.email!,
        action: 'REVIEW_REJECTED',
        targetType: 'review',
        targetId: reviewId,
        ipAddress,
        userAgent,
      });

    }
    
    // Revalidate relevant pages
    revalidatePath('/admin/reviews');
    revalidatePath('/admin/audit-logs');
    revalidatePath('/'); // Revalidate home page for featured providers
    revalidatePath('/category/all'); // Revalidate all providers page

    const review = (await reviewRef.get()).data();
    if(review) {
      revalidatePath(`/providers/${review.providerId}`);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error(`Error processing review action: ${action}`, error);
    if (error.message.includes('Invalid admin session')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message || 'An unexpected server error occurred.' }, { status: 500 });
  }
}

// GET – optional, simple status
export async function GET() {
  return NextResponse.json({ message: 'Review action API is live' });
}
