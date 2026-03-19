import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { Engagement } from '@/models/engagement';

// Mock Paystack Transfer API call
async function createPaystackTransfer(recipient: string, amount: number, reason: string) {
    console.log(`Mock Paystack Transfer: ${amount} to ${recipient} for ${reason}`);
    return {
        status: true,
        message: "Transfer created successfully",
        data: {
            reference: `transfer_${Date.now()}`,
            status: "otp"
        }
    };
}

async function getProviderMomo(providerId: string) {
    // In a real app, you'd have the provider's bank/momo details stored.
    // We'll return a mock recipient code for now.
    return `RCP_MOCK_${providerId}`;
}

export async function POST(req: NextRequest) {
    try {
        // 1. Verify Admin Role
        const authToken = req.headers.get('authorization')?.split('Bearer ')[1];
        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifyIdToken(authToken);
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        const user = userDoc.data();

        if (user?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { engagementId } = await req.json();

        if (!engagementId) {
            return NextResponse.json({ error: 'Engagement ID is required' }, { status: 400 });
        }

        await adminDb.runTransaction(async (transaction) => {
            const engagementRef = adminDb.collection('engagements').doc(engagementId);
            const engagementDoc = await transaction.get(engagementRef);

            if (!engagementDoc.exists) {
                throw new Error('Engagement not found');
            }

            const engagement = engagementDoc.data() as Engagement;

            // 2. Check Engagement Status
            if (engagement.jobStatus !== 'completed') {
                throw new Error('Job is not marked as completed.');
            }
            if (engagement.escrowStatus !== 'funded') {
                throw new Error('Escrow is not in a releasable state.');
            }
            
            // Check for active disputes
            const disputeQuery = adminDb.collection('disputes').where('engagementId', '==', engagementId).where('status', 'in', ['opened', 'under_review']);
            const disputeSnapshot = await disputeQuery.get();
            if (!disputeSnapshot.empty) {
                throw new Error('There is an active dispute on this engagement.');
            }

            // 3. Initiate Paystack Transfer
            const providerMomoRecipient = await getProviderMomo(engagement.providerId);
            const transferReason = `Payout for engagement: ${engagementId}`;
            const payoutAmount = engagement.providerReceivable * 100; // Paystack amount in pesewas

            const transferResponse = await createPaystackTransfer(providerMomoRecipient, payoutAmount, transferReason);

            if (!transferResponse.status) {
                throw new Error(`Paystack transfer failed: ${transferResponse.message}`);
            }

            // 4. Update Engagement
            transaction.update(engagementRef, {
                escrowStatus: 'released',
                payoutReference: transferResponse.data.reference,
                releasedAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            const now = Timestamp.now();

            // 5. Create Ledger Transactions
            // Commission Transaction
            const commissionRef = adminDb.collection('transactions').doc();
            transaction.set(commissionRef, {
                engagementId,
                type: 'commission',
                amount: engagement.commissionAmount,
                currency: 'GHS',
                status: 'success',
                reference: `comm_${engagementId}`,
                createdAt: now,
            });

            // Payout Transaction
            const payoutRef = adminDb.collection('transactions').doc();
            transaction.set(payoutRef, {
                engagementId,
                type: 'payout',
                amount: engagement.providerReceivable,
                currency: 'GHS',
                providerId: engagement.providerId,
                status: 'success',
                reference: transferResponse.data.reference,
                createdAt: now,
            });
        });

        return NextResponse.json({ success: true, message: 'Payout released successfully' });

    } catch (error: any) {
        console.error('Error releasing payout:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
