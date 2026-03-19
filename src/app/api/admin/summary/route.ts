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
        const disputesRef = adminDb.collection('disputes');

        // Calculate Total Escrow Held
        const escrowSnapshot = await engagementsRef.where('escrowStatus', 'in', ['funded', 'locked']).get();
        const totalEscrowHeld = escrowSnapshot.docs.reduce((sum, doc) => sum + doc.data().jobAmount, 0);

        // Calculate Total Commission Earned
        const commissionSnapshot = await engagementsRef.where('escrowStatus', '==', 'released').get();
        const totalCommissionEarned = commissionSnapshot.docs.reduce((sum, doc) => sum + doc.data().commissionAmount, 0);

        // Calculate Pending Payouts
        const pendingPayoutsSnapshot = await engagementsRef
            .where('jobStatus', '==', 'completed')
            .where('escrowStatus', '==', 'funded')
            .get();
        const pendingPayouts = pendingPayoutsSnapshot.docs.reduce((sum, doc) => sum + doc.data().providerReceivable, 0);

        // Calculate Active Disputes
        const activeDisputesSnapshot = await disputesRef.where('status', 'in', ['opened', 'under_review']).get();
        const activeDisputes = activeDisputesSnapshot.size;
        
        // Calculate Completed Jobs This Month
        const now = new Date();
        const startOfMonth = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 1));
        const completedJobsSnapshot = await engagementsRef
            .where('jobStatus', '==', 'completed')
            .where('updatedAt', '>=', startOfMonth)
            .get();
        const completedJobsThisMonth = completedJobsSnapshot.size;

        return NextResponse.json({
            totalEscrowHeld,
            totalCommissionEarned,
            pendingPayouts,
            activeDisputes,
            completedJobsThisMonth,
        });

    } catch (error) {
        console.error("Error fetching summary data:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
