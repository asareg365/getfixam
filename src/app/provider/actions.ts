'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Provider } from '@/lib/types';
import { logProviderAction } from '@/lib/audit-log';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Checks if a provider exists and is eligible for PIN login.
 */
export async function checkProviderForPinLogin(rawPhoneNumber: string): Promise<{ canLogin: boolean; message: string | null }> {
    if (!rawPhoneNumber || !/^0[0-9]{9}$/.test(rawPhoneNumber)) {
        return { canLogin: false, message: 'Please enter a valid 10-digit Ghanaian phone number starting with 0.' };
    }

    if (!adminDb) {
        console.error('Firebase Admin DB not initialized.');
        return { canLogin: false, message: 'Database service is not available.' };
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

        const pinHash = providerData.loginPinHash;
        const plainPin = providerData.loginPin;

        if (providerData.status === 'approved' && !pinHash && !plainPin) {
             return { canLogin: false, message: `Your account is approved, but no login PIN is set. Please contact support.` };
        }
        
        if (providerData.status === 'approved') {
            return { canLogin: true, message: null };
        }

        return { canLogin: false, message: "You are not eligible for PIN login at this time. Please contact support." };

    } catch (e: any) {
        console.error("Error in checkProviderForPinLogin:", e);
        return { canLogin: false, message: 'An unexpected error occurred while checking your account.' };
    }
}

/**
 * Updates an artisan's profile data.
 */
export async function updateProviderProfile(
    idToken: string,
    data: { name: string; whatsapp: string; digitalAddress: string; zone: string; }
) {
  if (!idToken) {
    return { success: false, error: "Authentication required." };
  }

  if (!adminDb || !adminAuth) {
    console.error('Firebase Admin not initialized.');
    return { success: false, error: 'Authentication or Database service is not available.' };
  }
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const providersRef = adminDb.collection('providers');
    
    // Strategy 1: Direct lookup by ID
    let providerDoc = await providersRef.doc(uid).get();
    
    // Strategy 2: Fallback to authUid query
    if (!providerDoc.exists) {
        const snap = await providersRef.where('authUid', '==', uid).limit(1).get();
        if (!snap.empty) {
            providerDoc = snap.docs[0];
        }
    }

    if (!providerDoc.exists) {
      return { success: false, error: 'Artisan profile not found. Please try logging in again.' };
    }

    const providerRef = providerDoc.ref;
    const currentProviderData = providerDoc.data() as any;

    const updateData: any = {
        name: data.name,
        whatsapp: data.whatsapp,
        digitalAddress: data.digitalAddress,
        location: {
            ...(currentProviderData.location || { region: 'Bono Region', city: 'Berekum' }),
            zone: data.zone,
        },
        updatedAt: FieldValue.serverTimestamp(),
    };

    await providerRef.update(updateData);
    
    const headersList = await headers();
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
    revalidatePath(`/providers/${providerRef.id}`);

    return { success: true };
  } catch (e: any) {
    console.error('Error updating provider profile:', e);
    return { success: false, error: e.message || 'An unexpected error occurred saving your changes.' };
  }
}

/**
 * Updates an artisan's specialized services list.
 */
export async function updateProviderServices(
    idToken: string,
    services: { name: string; active: boolean; price?: number }[]
) {
  if (!idToken) {
    return { success: false, error: "Authentication required." };
  }

  if (!adminDb || !adminAuth) {
    return { success: false, error: 'Authentication or Database service is not available.' };
  }
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const providersRef = adminDb.collection('providers');
    let providerDoc = await providersRef.doc(uid).get();
    
    if (!providerDoc.exists) {
        const snap = await providersRef.where('authUid', '==', uid).limit(1).get();
        if (!snap.empty) providerDoc = snap.docs[0];
    }

    if (!providerDoc.exists) {
      return { success: false, error: 'Artisan profile not found.' };
    }

    const providerRef = providerDoc.ref;
    await providerRef.update({
        services,
        updatedAt: FieldValue.serverTimestamp(),
    });
    
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    await logProviderAction({
        providerId: providerRef.id,
        action: 'PROVIDER_SERVICES_UPDATE',
        ipAddress,
        userAgent,
    });
    
    revalidatePath('/provider/services');
    revalidatePath('/provider/dashboard');
    revalidatePath(`/providers/${providerRef.id}`);

    return { success: true };
  } catch (e: any) {
    console.error('Error updating services:', e);
    return { success: false, error: e.message || 'Failed to update services.' };
  }
}

/**
 * Updates an artisan's weekly availability.
 */
export async function updateProviderAvailability(
    idToken: string,
    availability: { [day: string]: { from: string; to: string; active: boolean } }
) {
  if (!idToken) {
    return { success: false, error: "Authentication required." };
  }

  if (!adminDb || !adminAuth) {
    return { success: false, error: 'Authentication or Database service is not available.' };
  }
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const providersRef = adminDb.collection('providers');
    let providerDoc = await providersRef.doc(uid).get();
    
    if (!providerDoc.exists) {
        const snap = await providersRef.where('authUid', '==', uid).limit(1).get();
        if (!snap.empty) providerDoc = snap.docs[0];
    }

    if (!providerDoc.exists) {
      return { success: false, error: 'Artisan profile not found.' };
    }

    const providerRef = providerDoc.ref;
    await providerRef.update({
        availability,
        updatedAt: FieldValue.serverTimestamp(),
    });
    
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    await logProviderAction({
        providerId: providerRef.id,
        action: 'PROVIDER_AVAILABILITY_UPDATE',
        ipAddress,
        userAgent,
    });
    
    revalidatePath('/provider/availability');
    revalidatePath('/provider/dashboard');
    revalidatePath(`/providers/${providerRef.id}`);

    return { success: true };
  } catch (e: any) {
    console.error('Error updating availability:', e);
    return { success: false, error: e.message || 'Failed to update availability.' };
  }
}
