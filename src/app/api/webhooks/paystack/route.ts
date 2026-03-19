import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import * as crypto from 'crypto';

export async function POST(req: NextRequest) {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;
  const signature = req.headers.get('x-paystack-signature');
  const body = await req.text();

  const hash = crypto.createHmac('sha512', paystackSecretKey).update(body).digest('hex');

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === 'charge.success') {
    const { reference, amount } = event.data;

    if (!reference) {
      return NextResponse.json({ error: 'Reference not found in webhook payload' }, { status: 400 });
    }

    try {
      await adminDb.runTransaction(async (transaction) => {
        const engagementRef = adminDb.collection('engagements').doc(reference);
        const engagementDoc = await transaction.get(engagementRef);

        if (!engagementDoc.exists) {
            console.warn(`Engagement with reference ${reference} not found.`);
            // Return 200 to acknowledge receipt of the webhook but not process further.
            // This prevents Paystack from resending a webhook for a non-existent engagement.
            return;
        }

        const engagement = engagementDoc.data();

        // Idempotency check: Only process if the engagement is awaiting payment.
        if (engagement?.jobStatus !== 'awaiting_payment') {
            console.log(`Engagement ${reference} already processed.`);
            return;
        }
        
        // Verify that the amount paid matches the job amount.
        // Paystack sends amount in the smallest currency unit (e.g., pesewas).
        if (engagement.jobAmount !== (amount / 100)) {
            console.error(`Amount mismatch for engagement ${reference}. Expected ${engagement.jobAmount}, got ${amount / 100}.`);
            // Optionally, you could update the engagement with a 'failed_payment' status.
            return;
        }

        // Update Engagement
        transaction.update(engagementRef, {
          jobStatus: 'funded',
          escrowStatus: 'funded',
          fundedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        // Create Transaction record
        const transactionRef = adminDb.collection('transactions').doc();
        transaction.set(transactionRef, {
          engagementId: reference,
          type: 'payment',
          amount: engagement.jobAmount,
          currency: 'GHS',
          userId: engagement.customerId,
          status: 'success',
          reference: event.data.reference, // Paystack's own reference for the charge
          createdAt: Timestamp.now(),
        });
      });

    } catch (error) {
      console.error('Error processing Paystack webhook:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  return NextResponse.json({ status: 'success' }, { status: 200 });
}
