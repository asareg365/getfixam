'use server';

import { admin } from '@/lib/firebase-admin';

/**
 * Securely checks if a provider account is eligible for PIN login.
 * This is a server action called from the login page.
 * @param rawPhoneNumber The phone number entered by the user, expected in `0...` format.
 * @returns An object indicating if the provider can log in and an optional error message.
 */
export async function checkProviderForPinLogin(rawPhoneNumber: string): Promise<{ canLogin: boolean; message: string | null }> {
    if (!rawPhoneNumber || !/^0[0-9]{9}$/.test(rawPhoneNumber)) {
        return { canLogin: false, message: 'Please enter a valid 10-digit Ghanaian phone number starting with 0.' };
    }

    try {
        const providersRef = admin.firestore().collection('providers');
        const q = providersRef.where('phone', '==', rawPhoneNumber).limit(1);
        const providerSnap = await q.get();

        if (providerSnap.empty) {
            return { canLogin: false, message: "No provider account found for this phone number. Please list your business first." };
        }
        
        const providerData = providerSnap.docs[0].data();

        if (providerData.status === 'rejected' || providerData.status === 'suspended') {
             return { canLogin: false, message: `Your account is currently ${providerData.status}. Please contact support for assistance.` };
        }
        
        if (providerData.status === 'pending') {
            return { canLogin: false, message: `Your account is still pending approval. Please wait for an admin to verify your business.` };
        }

        if (providerData.status === 'approved' && !providerData.loginPinHash) {
             return { canLogin: false, message: `Your account is approved, but no login PIN is set. This might mean you've already used it. Please contact support.` };
        }
        
        if (providerData.status === 'approved' && providerData.loginPinHash) {
            return { canLogin: true, message: null };
        }

        return { canLogin: false, message: "You are not eligible for PIN login at this time. Please contact support." };

    } catch (e: any) {
        console.error("Error in checkProviderForPinLogin:", e);
        return { canLogin: false, message: 'An unexpected error occurred while checking your account.' };
    }
}
