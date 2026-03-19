import { adminDb } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const acceptSchema = z.object({
  providerId: z.string(),
});

export async function POST(request: NextRequest, context: any) {
  const { id: engagementId } = context.params; // Engagement ID
  const json = await request.json();
  const parsed = acceptSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const { providerId } = parsed.data;
  const engagementRef = adminDb.collection('engagements').doc(engagementId);

  try {
    const result = await adminDb.runTransaction(async (transaction) => {
      const engagementDoc = await transaction.get(engagementRef);

      if (!engagementDoc.exists) {
        throw new Error('Engagement not found');
      }

      const engagement = engagementDoc.data();

      if (!engagement) {
        throw new Error('Engagement data is missing.');
      }

      if (engagement.acceptedBy) {
        throw new Error('Job already taken');
      }

      transaction.update(engagementRef, {
        acceptedBy: providerId,
        status: 'accepted',
        updatedAt: new Date(),
      });

      return { requestedProviders: engagement.requestedProviders || [] };
    });

    if (result.requestedProviders.length > 0) {
      const batch = adminDb.batch();
      result.requestedProviders.forEach((pId: string) => {
        const jobRequestRef = adminDb
          .collection('providers')
          .doc(pId)
          .collection('jobRequests')
          .doc(engagementId);
        batch.delete(jobRequestRef);
      });
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: 'Job accepted successfully',
    });
  } catch (error: any) {
    console.error("Error accepting engagement:", error);

    if (error.message === 'Job already taken') {
      return NextResponse.json(
        { error: 'This job has already been accepted by another provider.' },
        { status: 409 }
      );
    }

    if (error.message === 'Engagement not found') {
      return NextResponse.json(
        { error: 'The requested job does not exist.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
