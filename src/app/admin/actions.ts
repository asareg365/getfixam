'use server';

import { cookies } from 'next/headers';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-guard';
import type { Provider } from '@/lib/types';
import { logAdminAction } from '@/lib/audit-log';
import { headers } from 'next/headers';


/** ----- AUTH ACTIONS ----- */
export async function logoutAction() {
  const cookieStore = await cookies();
  const cookieDomain = process.env.NODE_ENV === 'production' ? '.getfixam.com' : undefined;

  // Overwrite the cookie with an empty value and past expiration date
  cookieStore.delete({ 
    name: '__session',
    domain: cookieDomain,
    path: '/',
  });
  
  // Next.js redirects by throwing an error, which must happen OUTSIDE try/catch blocks
  redirect('/admin/login');
}

/** ----- SERVICE ACTIONS ----- */
const serviceSchema = z.object({
  name: z.string().min(3, 'Service name must be at least 3 characters.'),
  icon: z.string().min(1, 'Please select an icon.'),
  basePrice: z.coerce.number().min(0, 'Base price cannot be negative.'),
  maxSurge: z.coerce.number().min(1, 'Max surge must be at least 1.'),
  minSurge: z.coerce.number().min(1, 'Min surge must be at least 1.'),
  active: z.preprocess((val) => val === 'on', z.boolean()),
});

export async function addServiceAction(prevState: any, formData: FormData) {
    try {
        const adminContext = await requireAdmin();
        const validatedFields = serviceSchema.safeParse(Object.fromEntries(formData.entries()));

        if (!validatedFields.success) {
            return { success: false, errors: validatedFields.error.flatten().fieldErrors };
        }
  
        if (!adminDb) {
            throw new Error('Database connection not available.');
        }

        const { name, icon, basePrice, maxSurge, minSurge, active } = validatedFields.data;
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        const existingService = await adminDb.collection('services').where('slug', '==', slug).get();
        if (!existingService.empty) {
            return { success: false, message: 'A service with this name already exists.' };
        }

        const serviceData = {
            name, slug, icon, basePrice, maxSurge, minSurge, active, currency: 'GHS',
            createdAt: FieldValue.serverTimestamp(),
        };

        const newServiceRef = await adminDb.collection('services').add(serviceData);
        
        const headersList = await headers();
        await logAdminAction({
            adminEmail: adminContext.email!,
            action: 'SERVICE_CREATED',
            targetType: 'service',
            targetId: newServiceRef.id,
            ipAddress: headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown',
            userAgent: headersList.get('user-agent') || 'unknown',
        });
        
        revalidatePath('/admin/services');
        revalidatePath('/admin/audit-logs');
        return { success: true, message: 'Service added successfully.' };
    } catch (error: any) {
        if (error.digest?.includes('NEXT_REDIRECT')) throw error;
        console.error('Error adding service:', error);
        return { success: false, message: error.message || 'Failed to add service.' };
    }
}

/** ----- STANDBY ACTIONS ----- */

export async function getSwappableArtisans(serviceType: string, excludedArtisanIds: string[]): Promise<{ success: boolean; artisans?: Provider[]; message?: string; }> {
    try {
        await requireAdmin();
        
        if (!adminDb) {
            throw new Error('Database connection not available.');
        }

        const servicesSnap = await adminDb.collection('services').where('name', '==', serviceType).limit(1).get();
        if (servicesSnap.empty) {
            return { success: false, message: `Service '${serviceType}' not found.` };
        }
        const serviceId = servicesSnap.docs[0].id;

        const q = adminDb.collection('providers')
            .where('status', '==', 'approved')
            .where('serviceId', '==', serviceId);
        
        const providersSnap = await q.get();

        if (providersSnap.empty) {
            return { success: true, artisans: [] };
        }

        const artisans = providersSnap.docs
            .map((doc: QueryDocumentSnapshot) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || 'Unknown',
                    phone: data.phone || '',
                    serviceId: data.serviceId || '',
                    status: data.status || 'approved',
                    location: data.location || { region: 'Bono Region', city: 'Berekum', zone: 'Unknown' },
                } as Provider;
            })
            .filter((artisan: Provider) => !excludedArtisanIds.includes(artisan.id));

        return { success: true, artisans: artisans };
    } catch (error: any) {
        if (error.digest?.includes('NEXT_REDIRECT')) throw error;
        return { success: false, message: error.message || 'Failed to fetch artisans.' };
    }
}


export async function swapStandbyArtisan(artisanToRemoveId: string, artisanToAddId: string): Promise<{ success: boolean; message?: string; }> {
     try {
        await requireAdmin();

        if (!adminDb) {
            throw new Error('Database connection not available.');
        }

        const standbyRef = adminDb.collection('standby').doc('tomorrow');
        
        await adminDb.runTransaction(async (transaction: any) => {
            const standbyDoc = await transaction.get(standbyRef);
            if (!standbyDoc.exists) {
                throw new Error("Standby document not found.");
            }
            const currentArtisans = standbyDoc.data()?.artisans as string[] || [];
            const index = currentArtisans.indexOf(artisanToRemoveId);
            
            if (index === -1) return;

            const newArtisans = [...currentArtisans];
            newArtisans[index] = artisanToAddId;

            transaction.update(standbyRef, { artisans: newArtisans });
        });

        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error: any) {
        if (error.digest?.includes('NEXT_REDIRECT')) throw error;
        return { success: false, message: error.message || 'Failed to swap artisan.' };
    }
}

export async function overrideStandbyPool(): Promise<{ success: boolean; message?: string; }> {
    try {
        await requireAdmin();
        if (!adminDb) throw new Error('Database connection not available.');
        await adminDb.collection('standby').doc('tomorrow').delete();
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error: any) {
        if (error.digest?.includes('NEXT_REDIRECT')) throw error;
        return { success: false, message: error.message || 'Failed to override standby pool.' };
    }
}
