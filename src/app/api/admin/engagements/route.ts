import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { getCityConfig } from '@/lib/constants';

export async function GET(req: Request) {
    try {
        const authToken = req.headers.get('authorization')?.split('Bearer ')[1];
        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifyIdToken(authToken);
        const userDoc = await adminDb.collection('admins').doc(decodedToken.uid).get();
        if (!userDoc.exists || !userDoc.data()?.active) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const cityId = searchParams.get('city');
        const cityConfig = cityId ? getCityConfig(cityId) : null;

        if (!status) {
            return NextResponse.json({ error: 'Status parameter is required' }, { status: 400 });
        }

        let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = adminDb.collection('engagements');

        if (status === 'awaiting_release') {
            const seventyTwoHoursAgo = Timestamp.fromMillis(Date.now() - 72 * 60 * 60 * 1000);
            query = query.where('jobStatus', '==', 'awaiting_confirmation')
                         .where('completionMarkedAt', '<', seventyTwoHoursAgo);
        } else {
            query = query.where('escrowStatus', '==', status);
        }

        if (cityConfig) {
            query = query.where('city', '==', cityConfig.name);
        }

        const snapshot = await query.get();

        const engagements = await Promise.all(snapshot.docs.map(async (doc) => {
            const engagement = doc.data();
            let providerName = 'Artisan';

            if (engagement.providerId) {
                try {
                    const providerDoc = await adminDb.collection('providers').doc(engagement.providerId).get();
                    if (providerDoc.exists) {
                        providerName = providerDoc.data()?.name || 'Artisan';
                    }
                } catch (userError) {
                    console.error(`Failed to fetch provider ${engagement.providerId}:`, userError);
                }
            }
            
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
                daysLocked,
            };
        }));

        return NextResponse.json(engagements);

    } catch (error: any) {
        console.error("Error fetching engagements:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
