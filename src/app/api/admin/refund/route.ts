import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import axios from 'axios';

// This function initiates a refund via Paystack
async function createPaystackRefund(transactionRef: string, amount: number) {
    // The amount should be in the lowest currency unit (kobo for NGN, pesewas for GHS)
    const amountInPesewas = Math.round(amount * 100);

    try {
        const response = await axios.post('https://api.paystack.co/refund', {
            transaction: transactionRef,
            amount: amountInPesewas,
            // 'merchant_bear_cost' means we, the platform, will pay the refund processing fee.
            // Set to 'customer_bear_cost' if the customer should pay it.
            customer_bear_cost: true, 
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.data.status) {
            throw new Error(response.data.message || 'Paystack refund failed');
        }

        return response.data.data; // Full refund response from Paystack

    } catch (error: any) {
        console.error("Paystack refund error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to process refund with Paystack');
    }
}

export async function POST(req: Request) {
    try {
        const authToken = req.headers.get('authorization')?.split('Bearer ')[1];
        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifyIdToken(authToken);
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        if (userDoc.data()?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { engagementId, disputeId } = await req.json();
        if (!engagementId || !disputeId) {
            return NextResponse.json({ error: 'engagementId and disputeId are required' }, { status: 400 });
        }

        const db = adminDb;
        const engagementRef = db.collection('engagements').doc(engagementId);
        const disputeRef = db.collection('disputes').doc(disputeId);

        const engagementDoc = await engagementRef.get();
        if (!engagementDoc.exists) {
            return NextResponse.json({ error: 'Engagement not found' }, { status: 404 });
        }

        const engagement = engagementDoc.data()!;

        if (engagement.escrowStatus !== 'disputed') {
            return NextResponse.json({ error: 'Engagement is not in a disputed state.' }, { status: 400 });
        }

        // Call Paystack to refund the amount held in escrow
        await createPaystackRefund(engagement.paystackTransactionRef, engagement.jobAmount);

        // Update Firestore in a transaction to ensure atomicity
        await db.runTransaction(async (transaction) => {
            transaction.update(engagementRef, { 
                escrowStatus: 'refunded',
                updatedAt: new Date(),
            });
            transaction.update(disputeRef, { 
                status: 'resolved',
                resolution: 'refunded_to_customer',
                updatedAt: new Date(),
            });
        });

        return NextResponse.json({ message: 'Refund processed and statuses updated successfully.' });

    } catch (error: any) {
        console.error("Error processing refund:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
