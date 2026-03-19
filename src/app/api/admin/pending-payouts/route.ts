import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
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

        const db = adminDb;
        const snapshot = await db.collection('engagements')
            .where('jobStatus', '==', 'completed')
            .where('escrowStatus', '==', 'funded')
            .get();

        if (snapshot.empty) {
            return NextResponse.json([]);
        }

        const payouts = await Promise.all(snapshot.docs.map(async (doc) => {
            const engagement = doc.data();
            const providerId = engagement.provider;
            let providerData = { displayName: 'N/A', payoutDetails: {} };

            if (providerId) {
                try {
                    const providerDoc = await db.collection('users').doc(providerId).get();
                    if (providerDoc.exists) {
                        const { displayName, payoutDetails } = providerDoc.data() || {};
                        providerData = { displayName: displayName || 'N/A', payoutDetails: payoutDetails || {} };
                    }
                } catch (userError) {
                    console.error(`Failed to fetch provider ${providerId}:`, userError);
                }
            }

            return {
                engagementId: doc.id,
                providerName: providerData.displayName,
                receivable: engagement.providerReceivable,
                payoutDetails: providerData.payoutDetails,
            };
        }));

        return NextResponse.json(payouts);

    } catch (error) {
        console.error("Error fetching pending payouts:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
