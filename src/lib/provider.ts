'use server';

import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { Provider } from '@/lib/types';

/**
 * Securely fetches provider data from the server and links their Firebase Auth UID on first login.
 * This is called from the client with the user's ID token.
 * @param idToken The Firebase ID token of the currently signed-in user.
 * @returns An object containing the provider data or an error.
 */
export async function getProviderData(idToken: string): Promise<{ provider: Provider | null; error: string | null }> {
    if (!idToken) {
        return { provider: null, error: "Authentication token is missing." };
    }
    if (!adminAuth || !adminDb) {
        return { provider: null, error: "Firebase Admin is not initialized." };
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const phone = decodedToken.phone_number;

        // 1. Try to find provider by UID
        const providersRef = adminDb.collection('providers');
        let providerQuery = providersRef.where('authUid', '==', uid);
        let providerSnap = await providerQuery.get();
        let providerDoc;

        if (providerSnap.empty) {
            // 2. If not found, try to find by phone number
            if (!phone) {
                return { provider: null, error: "Your account has no phone number associated. Please contact support." };
            }
            // In Ghana, numbers start with 0, but Firebase stores them as +233...
            // We match the format in the DB, which is `0...`
            const localPhoneNumber = phone.startsWith('+233') ? '0' + phone.substring(4) : phone;
            providerQuery = providersRef.where('phone', '==', localPhoneNumber);
            providerSnap = await providerQuery.get();

            if (!providerSnap.empty) {
                // 3. Found by phone! Link the UID for future logins.
                providerDoc = providerSnap.docs[0];
                await providerDoc.ref.update({ authUid: uid });
            } else {
                // 4. Not found by UID or Phone. They need to register.
                return { provider: null, error: "No provider account found for this phone number. Please create a listing first." };
            }
        } else {
            providerDoc = providerSnap.docs[0];
        }

        const providerData = providerDoc.data();
        let categoryName = 'N/A';
        if (providerData.serviceId) {
            const serviceDoc = await adminDb.collection('services').doc(providerData.serviceId).get();
            if(serviceDoc.exists) {
                categoryName = serviceDoc.data()?.name;
            }
        }
        
        const data = {
            id: providerDoc.id,
            name: providerData.name ?? 'Unknown',
            phone: providerData.phone ?? '',
            whatsapp: providerData.whatsapp ?? '',
            digitalAddress: providerData.digitalAddress ?? '',
            location: providerData.location ?? { region: '', city: '', zone: ''},
            status: providerData.status ?? 'pending',
            verified: providerData.verified ?? false,
            isFeatured: providerData.isFeatured ?? false,
            rating: providerData.rating ?? 0,
            reviewCount: providerData.reviewCount ?? 0,
            imageId: providerData.imageId ?? '',
            serviceId: providerData.serviceId ?? '',
            category: categoryName,
            createdAt: providerData.createdAt?.toDate().toISOString() ?? new Date(0).toISOString(),
            approvedAt: providerData.approvedAt?.toDate().toISOString(),
            featuredUntil: providerData.featuredUntil?.toDate().toISOString(),
        } as Provider;
        
        return { provider: data, error: null };

    } catch (e: any) {
        console.error("Error in getProviderData:", e);
        if (e.code === 'auth/id-token-expired') {
            return { provider: null, error: 'Your session has expired. Please log in again.' };
        }
        return { provider: null, error: e.message || 'An unexpected error occurred while fetching your account details.' };
    }
}
