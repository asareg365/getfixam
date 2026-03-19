import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const authToken = req.headers.get('authorization')?.split('Bearer ')[1];
        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifyIdToken(authToken);
        const customerId = decodedToken.uid;

        const query = adminDb.collection('engagements').where('customer', '==', customerId).orderBy('createdAt', 'desc');
        const snapshot = await query.get();

        if (snapshot.empty) {
            return NextResponse.json([]);
        }

        const engagements = await Promise.all(snapshot.docs.map(async (doc) => {
            const engagement = doc.data();
            let providerName = 'N/A';

            if (engagement.provider) {
                try {
                    const providerDoc = await adminDb.collection('users').doc(engagement.provider).get();
                    if (providerDoc.exists) {
                        providerName = providerDoc.data()?.displayName || 'N/A';
                    }
                } catch (userError) {
                    console.error(`Failed to fetch provider ${engagement.provider}:`, userError);
                }
            }
            
            return {
                id: doc.id,
                jobTitle: engagement.jobTitle, // Assuming jobTitle is a field
                jobAmount: engagement.jobAmount,
                jobStatus: engagement.jobStatus,
                escrowStatus: engagement.escrowStatus,
                providerName,
                createdAt: engagement.createdAt.toDate(),
            };
        }));

        return NextResponse.json(engagements);

    } catch (error: any) {
        console.error("Error fetching customer engagements:", error);
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'ID token has expired' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
