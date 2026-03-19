import { NextResponse, NextRequest } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: NextRequest, context: any) {
    try {
        const authToken = req.headers.get('authorization')?.split('Bearer ')[1];
        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifyIdToken(authToken);
        const providerId = decodedToken.uid;
        const { id: engagementId } = context.params;

        const engagementRef = adminDb.collection('engagements').doc(engagementId);
        const engagementDoc = await engagementRef.get();

        if (!engagementDoc.exists) {
            return NextResponse.json({ error: 'Engagement not found' }, { status: 404 });
        }

        const engagement = engagementDoc.data()!;

        // 1. Authorization Check: Ensure the user is the provider for this engagement
        if (engagement.provider !== providerId) {
            return NextResponse.json({ error: 'Forbidden: You are not the provider for this engagement.' }, { status: 403 });
        }

        // 2. Status Check: Ensure the job is in a state that can be marked as completed
        if (engagement.jobStatus !== 'in_progress') {
            return NextResponse.json({ error: `Cannot mark as complete. Job status is currently: ${engagement.jobStatus}` }, { status: 400 });
        }

        // 3. Update the engagement document
        await engagementRef.update({
            jobStatus: 'awaiting_confirmation',
            escrowStatus: 'locked', // Keep it locked during the review period
            completionMarkedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        return NextResponse.json({ message: 'Job marked as awaiting confirmation. The 72-hour review period has begun.' });

    } catch (error: any) {
        console.error("Error marking job as completed:", error);
        // Check for specific Firebase auth errors if needed
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'ID token has expired' }, { status: 401 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
