import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: Request) {
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

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        if (!status) {
            return NextResponse.json({ error: 'Status parameter is required' }, { status: 400 });
        }

        const db = adminDb;
        let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>;

        if (status === 'awaiting_release') {
            // Calculate the timestamp for 72 hours ago
            const seventyTwoHoursAgo = Timestamp.fromMillis(Date.now() - 72 * 60 * 60 * 1000);
            // Query for jobs that were marked for completion before this time and are still awaiting confirmation
            query = db.collection('engagements')
                      .where('jobStatus', '==', 'awaiting_confirmation')
                      .where('completionMarkedAt', '<', seventyTwoHoursAgo);
        } else {
            // Existing logic for other statuses
            query = db.collection('engagements').where('escrowStatus', '==', status);
        }

        const snapshot = await query.get();

        const engagements = await Promise.all(snapshot.docs.map(async (doc) => {
            const engagement = doc.data();
            let providerName = 'N/A';

            if (engagement.provider) {
                try {
                    const providerDoc = await db.collection('users').doc(engagement.provider).get();
                    if (providerDoc.exists) {
                        providerName = providerDoc.data()?.displayName || 'N/A';
                    }
                } catch (userError) {
                    console.error(`Failed to fetch provider ${engagement.provider}:`, userError);
                }
            }
            
            // Calculate days locked if completionMarkedAt exists
            let daysLocked = 0;
            if (engagement.completionMarkedAt) {
                const markedAt = engagement.completionMarkedAt.toDate();
                const now = new Date();
                daysLocked = Math.floor((now.getTime() - markedAt.getTime()) / (1000 * 60 * 60 * 24));
            }

            return {
                id: doc.id,
                ...engagement,
                providerName,
                daysLocked, // Add this to the response
            };
        }));

        return NextResponse.json(engagements);

    } catch (error) {
        console.error("Error fetching engagements:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
