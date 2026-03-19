import { NextResponse, NextRequest } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { Payout } from '@/models/payout';

// Mock Paystack API call
async function initiatePaystackTransfer(amount: number, recipient: string, reason: string) {
  console.log(`Mock Paystack Transfer: ${amount} to ${recipient} for ${reason}`);
  return { status: true, data: { status: 'success', transfer_code: 'MOCK_TRANSFER_CODE' } };
}

export async function POST(req: NextRequest, context: any) {
    try {
        const authToken = req.headers.get('authorization')?.split('Bearer ')[1];
        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifyIdToken(authToken);
        const customerId = decodedToken.uid;
        const { id: engagementId } = context.params;

        const engagementRef = adminDb.collection('engagements').doc(engagementId);
        const engagementDoc = await engagementRef.get();

        if (!engagementDoc.exists) {
            return NextResponse.json({ error: 'Engagement not found' }, { status: 404 });
        }

        const engagement = engagementDoc.data()!;

        if (engagement.customer !== customerId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (engagement.jobStatus !== 'awaiting_confirmation') {
            return NextResponse.json({ error: `Cannot confirm completion. Job status is: ${engagement.jobStatus}` }, { status: 400 });
        }

        const payoutRef = adminDb.collection('payouts').doc();
        const newPayout: Payout = {
            engagementId,
            providerId: engagement.providerId,
            amount: engagement.providerReceivable,
            currency: engagement.currency,
            status: 'pending',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        await payoutRef.set(newPayout);

        const transfer = await initiatePaystackTransfer(engagement.providerReceivable, engagement.providerId, `Payout for engagement ${engagementId}`);

        if (transfer.status && transfer.data.status === 'success') {
            await engagementRef.update({
                jobStatus: 'completed',
                escrowStatus: 'released',
                payoutStatus: 'paid',
                releasedAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
            await payoutRef.update({ 
                status: 'paid', 
                transferDetails: transfer.data,
                updatedAt: Timestamp.now(),
            });
        } else {
            await engagementRef.update({
                payoutStatus: 'failed',
                updatedAt: Timestamp.now(),
            });
            await payoutRef.update({ 
                status: 'failed', 
                errorMessage: 'Paystack transfer failed',
                updatedAt: Timestamp.now(),
            });
        }

        return NextResponse.json({ message: 'Job completion confirmed. Payout initiated.' });

    } catch (error: any) {
        console.error("Error confirming job completion:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
