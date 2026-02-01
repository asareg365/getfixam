'use server';

import { admin } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { revalidatePath } from 'next/cache';
import { logAdminAction } from '@/lib/audit-log';

export async function POST(req: NextRequest, { params }: { params: { action: 'approve' | 'reject' } }) {
  try {
    const adminUser = await requireAdmin();
    const body = await req.formData();
    const reviewId = body.get('reviewId') as string;

    if (!reviewId) {
      return NextResponse.json({ success: false, error: 'Review ID missing' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const reviewRef = admin.firestore().collection('reviews').doc(reviewId);
    
    if (params.action === 'approve') {
      let reviewData: admin.firestore.DocumentData;
      let providerData: admin.firestore.DocumentData;

      await admin.firestore().runTransaction(async (transaction) => {
        const reviewSnap = await transaction.get(reviewRef);
        if (!reviewSnap.exists) throw new Error('Review not found.');
        
        reviewData = reviewSnap.data()!;
        if (reviewData.status === 'approved') return;

        const providerRef = admin.firestore().collection('providers').doc(reviewData.providerId);
        const providerSnap = await transaction.get(providerRef);
        if (!providerSnap.exists) throw new Error('Associated provider not found.');

        providerData = providerSnap.data()!;
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
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          approvedBy: adminUser.email,
        });
      });

      // Log action after transaction commits
      await logAdminAction({
        adminEmail: adminUser.email!,
        action: 'approve',
        targetType: 'review',
        targetId: reviewId,
        ipAddress,
        userAgent,
      });

    } else if (params.action === 'reject') {
      const reviewSnap = await reviewRef.get();
      if (!reviewSnap.exists) throw new Error('Review not found.');
      const reviewData = reviewSnap.data()!;

      if (reviewData.status !== 'pending') {
        return NextResponse.json({ success: true, message: 'Review was not in pending state.' });
      }
      
      await reviewRef.update({
        status: 'rejected',
        rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
        rejectedBy: adminUser.email,
      });

      await logAdminAction({
        adminEmail: adminUser.email!,
        action: 'reject',
        targetType: 'review',
        targetId: reviewId,
        ipAddress,
        userAgent,
      });

    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
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
    console.error(`Error processing review action: ${params.action}`, error);
    if (error.message.includes('Invalid admin session')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Unexpected error' }, { status: 500 });
  }
}

    