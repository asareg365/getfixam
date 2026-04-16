
'use server';

import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { Provider } from '@/lib/types';

/**
 * Securely fetches provider data from the server.
 * Can be used in two modes:
 * 1. Standard: Fetches the data for the authenticated user (via idToken).
 * 2. Impersonation: Fetches data for a specific providerId, but only if the authenticated user is an admin.
 */
export async function getProviderData(
    idToken: string,
    impersonatedProviderId?: string | null
): Promise<{ provider: Provider | null; error: string | null }> {
    if (!idToken) {
        return { provider: null, error: "Authentication token is missing." };
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const isAdmin = decodedToken.role === 'admin' || decodedToken.role === 'super_admin';

        let providerDoc: FirebaseFirestore.DocumentSnapshot | null = null;
        const providersRef = adminDb.collection('providers');

        if (impersonatedProviderId) {
            if (!isAdmin) {
                return { provider: null, error: "You are not authorized to view this profile." };
            }
            const doc = await providersRef.doc(impersonatedProviderId).get();
            if (doc.exists) {
                providerDoc = doc;
            }
        } else {
            const uid = decodedToken.uid;
            const phoneFromToken = decodedToken.phone_number;

            // Multi-strategy lookup to find the provider document
            // Strategy 1: Find by Firestore Document ID matching the UID
            const docById = await providersRef.doc(uid).get();
            if (docById.exists) {
                providerDoc = docById;
            } else {
                // Strategy 2: Find by the 'authUid' or 'uid' field
                const queryByUid = await providersRef.where('authUid', '==', uid).limit(1).get();
                if (!queryByUid.empty) {
                    providerDoc = queryByUid.docs[0];
                } else {
                    const queryByLegacyUid = await providersRef.where('uid', '==', uid).limit(1).get();
                    if (!queryByLegacyUid.empty) {
                        providerDoc = queryByLegacyUid.docs[0];
                    } else if (phoneFromToken) {
                        // Strategy 3: Find by normalized phone number
                        const localPhone = phoneFromToken.startsWith('+233') ? '0' + phoneFromToken.substring(4) : phoneFromToken;
                        const queryByPhone = await providersRef.where('phone', '==', localPhone).limit(1).get();
                        if (!queryByPhone.empty) {
                            providerDoc = queryByPhone.docs[0];
                            // Link this UID for future fast lookups
                            await providerDoc.ref.update({ authUid: uid });
                        }
                    }
                }
            }
        }

        if (!providerDoc || !providerDoc.exists) {
            return { provider: null, error: "Artisan profile not found. Please ensure your listing has been approved." };
        }

        const providerData = providerDoc.data();
        if (!providerData) {
            return { provider: null, error: "Artisan profile data could not be read." };
        }

        // Map the service category name
        let categoryName = 'Artisan';
        if (providerData.serviceId) {
            try {
                const serviceDoc = await adminDb.collection('services').doc(providerData.serviceId).get();
                if (serviceDoc.exists) {
                    categoryName = serviceDoc.data()?.name || 'Artisan';
                }
            } catch (e) {
                categoryName = providerData.category || 'Artisan';
            }
        }

        const data = {
            id: providerDoc.id,
            name: providerData.name ?? 'Unnamed Business',
            phone: providerData.phone ?? '',
            whatsapp: providerData.whatsapp ?? '',
            digitalAddress: providerData.digitalAddress ?? '',
            location: providerData.location ?? { region: 'Bono Region', city: 'Berekum', zone: 'Unknown' },
            status: providerData.status ?? 'pending',
            verified: providerData.verified ?? false,
            isFeatured: providerData.isFeatured ?? false,
            rating: Number(providerData.rating) || 0,
            reviewCount: Number(providerData.reviewCount) || 0,
            imageId: providerData.imageId ?? '',
            serviceId: providerData.serviceId ?? '',
            category: categoryName,
            services: providerData.services || [],
            availability: providerData.availability || {},
            createdAt: providerData.createdAt?.toDate?.()?.toISOString() || new Date(0).toISOString(),
            approvedAt: providerData.approvedAt?.toDate?.()?.toISOString(),
        } as Provider;

        return { provider: data, error: null };

    } catch (e: any) {
        console.error("Error in getProviderData:", e);
        if (e.code === 'auth/id-token-expired') {
            return { provider: null, error: 'Your session has expired. Please log in again.' };
        }
        return { provider: null, error: 'The system failed to retrieve your profile. Please try again.' };
    }
}
