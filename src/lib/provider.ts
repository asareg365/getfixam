'use server';

import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { Provider } from '@/lib/types';

/**
 * Securely fetches provider data from the server and links their Firebase Auth UID.
 * This is called from the client with the user's ID token.
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
        const phoneFromToken = decodedToken.phone_number;

        const providersRef = adminDb.collection('providers');
        
        // Strategy 1: Direct lookup by ID (Since we use providerId as the UID in custom tokens)
        const directDoc = await providersRef.doc(uid).get();
        let providerDoc = directDoc.exists ? directDoc : null;

        // Strategy 2: Fallback to query by authUid field (for historical compatibility)
        if (!providerDoc) {
            const authUidQuery = await providersRef.where('authUid', '==', uid).limit(1).get();
            if (!authUidQuery.empty) {
                providerDoc = authUidQuery.docs[0];
            }
        }

        // Strategy 3: Fallback to phone number if available in token
        if (!providerDoc && phoneFromToken) {
            const localPhone = phoneFromToken.startsWith('+233') ? '0' + phoneFromToken.substring(4) : phoneFromToken;
            const phoneQuery = await providersRef.where('phone', '==', localPhone).limit(1).get();
            if (!phoneQuery.empty) {
                providerDoc = phoneQuery.docs[0];
                // Link the UID for future direct lookups
                await providerDoc.ref.update({ authUid: uid });
            }
        }

        if (!providerDoc) {
            return { provider: null, error: "Artisan profile not found. Please ensure your listing has been approved." };
        }

        const providerData = providerDoc.data();
        let categoryName = 'Artisan';
        
        if (providerData.serviceId) {
            try {
                const serviceDoc = await adminDb.collection('services').doc(providerData.serviceId).get();
                if (serviceDoc.exists) {
                    categoryName = serviceDoc.data()?.name || 'Artisan';
                }
            } catch (e) {
                // Fallback if services collection is slow
            }
        }
        
        // Ensure authUid is set for future updates
        if (providerData.authUid !== uid) {
            await providerDoc.ref.update({ authUid: uid }).catch(() => {});
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
            // CRITICAL FIX: Ensure availability is mapped as an object, not an empty array fallback
            availability: (providerData.availability && typeof providerData.availability === 'object' && !Array.isArray(providerData.availability)) ? providerData.availability : {},
            createdAt: providerData.createdAt?.toDate?.() ? providerData.createdAt.toDate().toISOString() : (typeof providerData.createdAt === 'string' ? providerData.createdAt : new Date(0).toISOString()),
            approvedAt: providerData.approvedAt?.toDate?.() ? providerData.approvedAt.toDate().toISOString() : undefined,
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
