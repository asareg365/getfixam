'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Provider } from '@/lib/types';
import { logProviderAction } from '@/lib/audit-log';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Re-using getProviderData from lib/provider.ts is a good idea.
import { getProviderData } from '@/lib/provider';

export async function checkProviderForPinLogin(rawPhoneNumber: string): Promise<{ canLogin: boolean; message: string | null }> {
    if (!rawPhoneNumber || !/^0[0-9]{9}$/.test(rawPhoneNumber)) {
        return { canLogin: false, message: 'Please enter a valid 10-digit Ghanaian phone number starting with 0.' };
    }

    try {
        const providersRef = adminDb.collection('providers');
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


export async function updateProviderProfile(
    idToken: string,
    data: { name: string; whatsapp: string; digitalAddress: string; zone: string; }
) {
  if (!idToken) {
    return { success: false, error: "Authentication required." };
  }
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const providersRef = adminDb.collection('providers');
    const snap = await providersRef.where('authUid', '==', uid).limit(1).get();

    if (snap.empty) {
      return { success: false, error: 'Provider not found.' };
    }

    const providerRef = snap.docs[0].ref;
    const currentProviderData = snap.docs[0].data() as Provider;

    // Sanitize and validate the input data
    const updateData: any = {
        name: data.name,
        whatsapp: data.whatsapp,
        digitalAddress: data.digitalAddress,
        location: {
            ...currentProviderData.location,
            zone: data.zone,
        },
        updatedAt: FieldValue.serverTimestamp(),
    };

    await providerRef.update(updateData);
    
    // Log the action
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    await logProviderAction({
        providerId: providerRef.id,
        action: 'PROVIDER_PROFILE_UPDATE',
        ipAddress,
        userAgent,
    });
    
    revalidatePath('/provider/profile');
    revalidatePath('/provider/dashboard');

    return { success: true };
  } catch (e: any) {
    console.error('Error updating provider profile:', e);
    return { success: false, error: e.message || 'An unexpected error occurred.' };
  }
}
