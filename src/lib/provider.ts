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
        const isAdmin = decodedToken.admin === true;

        let providerDoc: FirebaseFirestore.DocumentSnapshot | null = null;
        const providersRef = adminDb.collection('providers');

        if (impersonatedProviderId) {
            if (!isAdmin) {
                return { provider: null, error: "You are not authorized to view this profile." };
            }
            // Admin Impersonation Mode: Fetch by the provided ID
            const doc = await providersRef.doc(impersonatedProviderId).get();
            if (doc.exists) {
                providerDoc = doc;
            }
        } else {
            // Standard Mode: Fetch for the logged-in user
            const uid = decodedToken.uid;
            const phoneFromToken = decodedToken.phone_number;

            // Strategies to find the provider document
            const strategies = [
                () => providersRef.doc(uid).get(),
                async () => {
                    const query = await providersRef.where('authUid', '==', uid).limit(1).get();
                    return query.empty ? null : query.docs[0];
                },
                async () => {
                    if (!phoneFromToken) return null;
                    const localPhone = phoneFromToken.startsWith('+233') ? '0' + phoneFromToken.substring(4) : phoneFromToken;
                    const query = await providersRef.where('phone', '==', localPhone).limit(1).get();
                    if (!query.empty) {
                        // Link the UID for future direct lookups
                        await query.docs[0].ref.update({ authUid: uid });
                        return query.docs[0];
                    }
                    return null;
                }
            ];

            for (const strategy of strategies) {
                const doc = await strategy();
                if (doc && doc.exists) {
                    providerDoc = doc as FirebaseFirestore.DocumentSnapshot;
                    break;
                }
            }
        }

        if (!providerDoc) {
            return { provider: null, error: "Artisan profile not found. Please ensure your listing has been approved." };
        }

        const providerData = providerDoc.data();
        if (!providerData) {
            return { provider: null, error: "Artisan profile data could not be read." };
        }

        let categoryName = 'Artisan';
        if (providerData.serviceId) {
            const serviceDoc = await adminDb.collection('services').doc(providerData.serviceId).get();
            if (serviceDoc.exists) {
                categoryName = serviceDoc.data()?.name || 'Artisan';
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
            rating: providerData.rating ?? 0,
            reviewCount: providerData.reviewCount ?? 0,
            imageId: providerData.imageId ?? '',
            serviceId: providerData.serviceId ?? '',
            category: categoryName,
            services: providerData.services || [],
            availability: (providerData.availability && typeof providerData.availability === 'object' && !Array.isArray(providerData.availability)) ? providerData.availability : {},
            createdAt: providerData.createdAt?.toDate?.()?.toISOString() || new Date(0).toISOString(),
            approvedAt: providerData.approvedAt?.toDate?.()?.toISOString(),
        } as Provider;

        return { provider: data, error: null };

    } catch (e: any) {
        console.error("Error in getProviderData:", e);
        if (e.code === 'auth/id-token-expired') {
            return { provider: null, error: 'Your secure session has expired. Please log in again.' };
        }
        return { provider: null, error: 'The server encountered an error retrieving your profile. Please try again.' };
    }
}
