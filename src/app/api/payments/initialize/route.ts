import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { calculateCommission } from '@/lib/payments';
import { Engagement } from '@/models/engagement';
import { Timestamp } from 'firebase-admin/firestore';

// In a real application, you would use the paystack-sdk or a similar library
// For this example, we'll mock the Paystack API call
async function initializePaystackTransaction(email: string, amount: number, reference: string) {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  // const response = await fetch('https://api.paystack.co/transaction/initialize', {
  //   method: 'POST',
  //   headers: {
  //     Authorization: `Bearer ${paystackSecretKey}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ email, amount, reference }),
  // });
  // const data = await response.json();
  // return data;

  console.log(`Mock Paystack Initialized: ${amount} for ${email} with ref ${reference}`);
  return {
    status: true,
    message: 'Authorization URL created',
    data: {
      authorization_url: `https://checkout.paystack.com/mock-url-for-${reference}`,
      access_code: `mock_access_code_for_${reference}`,
      reference: reference,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const { customerId, providerId, jobAmount, serviceTitle, description, customerEmail } = await req.json();

    if (!customerId || !providerId || !jobAmount || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const engagementRef = adminDb.collection('engagements').doc();

    const commissionPercentage = 12; // 12% commission
    const commissionAmount = calculateCommission({ jobAmount, commissionPercentage });
    const providerReceivable = jobAmount - commissionAmount;

    const newEngagement: Partial<Engagement> = {
      customerId,
      providerId,
      serviceTitle: serviceTitle || '',
      description: description || '',
      currency: 'GHS',
      jobAmount,
      commissionPercentage,
      commissionAmount,
      providerReceivable,
      jobStatus: 'awaiting_payment',
      escrowStatus: 'unfunded',
      createdAt: Timestamp.now() as any,
      updatedAt: Timestamp.now() as any,
    };

    const paystackResponse = await initializePaystackTransaction(customerEmail, jobAmount * 100, engagementRef.id);

    if (!paystackResponse.status) {
      return NextResponse.json({ error: 'Failed to initialize payment', details: paystackResponse.message }, { status: 500 });
    }

    newEngagement.paymentReference = paystackResponse.data.reference;

    await engagementRef.set(newEngagement);

    return NextResponse.json({ authorizationUrl: paystackResponse.data.authorization_url });

  } catch (error) {
    console.error('Error initializing payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
