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
        const cityId = searchParams.get('city');
        const cityConfig = cityId ? getCityConfig(cityId) : null;

        const engagementsRef = adminDb.collection('engagements');
        const disputesRef = adminDb.collection('disputes');

        let escrowQuery = engagementsRef.where('escrowStatus', 'in', ['funded', 'locked']);
        let commissionQuery = engagementsRef.where('escrowStatus', '==', 'released');
        let pendingPayoutQuery = engagementsRef.where('jobStatus', '==', 'completed').where('escrowStatus', '==', 'funded');
        
        const now = new Date();
        const startOfMonth = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 1));
        let completedJobsQuery = engagementsRef.where('jobStatus', '==', 'completed').where('updatedAt', '>=', startOfMonth);

        // Apply City Filter if provided
        if (cityConfig) {
            // Note: This assumes engagements have a 'city' or 'location.city' field. 
            // In your schema, Job and Provider have location.city.
            // Engagements should ideally have a city field for fast filtering.
            escrowQuery = escrowQuery.where('city', '==', cityConfig.name);
            commissionQuery = commissionQuery.where('city', '==', cityConfig.name);
            pendingPayoutQuery = pendingPayoutQuery.where('city', '==', cityConfig.name);
            completedJobsQuery = completedJobsQuery.where('city', '==', cityConfig.name);
        }

        const [escrowSnap, commissionSnap, pendingSnap, completedSnap] = await Promise.all([
            escrowQuery.get(),
            commissionQuery.get(),
            pendingPayoutQuery.get(),
            completedJobsQuery.get()
        ]);

        const totalEscrowHeld = escrowSnap.docs.reduce((sum, doc) => sum + (doc.data().jobAmount || 0), 0);
        const totalCommissionEarned = commissionSnap.docs.reduce((sum, doc) => sum + (doc.data().commissionAmount || 0), 0);
        const pendingPayouts = pendingSnap.docs.reduce((sum, doc) => sum + (doc.data().providerReceivable || 0), 0);
        
        // Disputes are harder to city-filter without a nested field, so we fetch all if city provided
        // and filter in memory or rely on engagement back-refs. For MVP, we show all active if no city index.
        const activeDisputesSnap = await disputesRef.where('status', 'in', ['opened', 'under_review']).get();

        return NextResponse.json({
            totalEscrowHeld,
            totalCommissionEarned,
            pendingPayouts,
            activeDisputes: activeDisputesSnap.size,
            completedJobsThisMonth: completedSnap.size,
        });

    } catch (error: any) {
        console.error("Error fetching summary data:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
