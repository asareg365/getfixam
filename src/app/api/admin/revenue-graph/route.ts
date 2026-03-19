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
        const user = userDoc.data();

        if (user?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const engagementsRef = adminDb.collection('engagements');
        const months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            const startOfMonth = Timestamp.fromDate(d);
            const endOfMonth = Timestamp.fromDate(new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59));

            // Gross Job Value: Sum of `jobAmount` for all completed jobs in that month
            const grossSnapshot = await engagementsRef
                .where('jobStatus', '==', 'completed')
                .where('createdAt', '>=', startOfMonth)
                .where('createdAt', '<=', endOfMonth)
                .get();
            const grossJobValue = grossSnapshot.docs.reduce((sum, doc) => sum + doc.data().jobAmount, 0);

            // Commission Earned: Sum of `commissionAmount` for released payouts in that month
            const commissionSnapshot = await engagementsRef
                .where('escrowStatus', '==', 'released')
                .where('releasedAt', '>=', startOfMonth)
                .where('releasedAt', '<=', endOfMonth)
                .get();
            const commissionEarned = commissionSnapshot.docs.reduce((sum, doc) => sum + doc.data().commissionAmount, 0);

            // Refund Volume: Sum of `jobAmount` for refunded jobs in that month
            const refundSnapshot = await engagementsRef
                .where('escrowStatus', '==', 'refunded')
                .where('updatedAt', '>=', startOfMonth) // Assuming updatedAt reflects refund time
                .where('updatedAt', '<=', endOfMonth)
                .get();
            const refundVolume = refundSnapshot.docs.reduce((sum, doc) => sum + doc.data().jobAmount, 0);

            months.push({
                month: monthName,
                grossJobValue,
                commissionEarned,
                refundVolume,
            });
        }

        return NextResponse.json(months);

    } catch (error) {
        console.error("Error fetching revenue graph data:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
