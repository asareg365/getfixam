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
        const snapshot = await db.collection('disputes')
            .where('status', 'in', ['opened', 'under_review'])
            .get();

        if (snapshot.empty) {
            return NextResponse.json([]);
        }

        const disputes = await Promise.all(snapshot.docs.map(async (doc) => {
            const dispute = doc.data();
            const engagementId = dispute.engagementId;
            let engagementData = { jobTitle: 'N/A' };

            if (engagementId) {
                try {
                    const engagementDoc = await db.collection('engagements').doc(engagementId).get();
                    if (engagementDoc.exists) {
                        engagementData.jobTitle = engagementDoc.data()?.jobTitle || 'N/A';
                    }
                } catch (engError) {
                    console.error(`Failed to fetch engagement ${engagementId}:`, engError);
                }
            }

            return {
                disputeId: doc.id,
                ...dispute,
                jobTitle: engagementData.jobTitle,
            };
        }));

        return NextResponse.json(disputes);

    } catch (error) {
        console.error("Error fetching disputes:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
