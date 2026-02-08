'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { logAdminAction } from '@/lib/audit-log';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

// A custom function to get admin user without the lockout check. For this page only.
async function getAdminUserForSecurityPage(): Promise<{ uid: string; email: string | undefined; }> {
    const cookieStore = await cookies();
    const token = cookieStore.get('__session')?.value;
    if (!token) throw new Error("Authentication required.");

    try {
        if (!adminDb) {
            throw new Error("Database not initialized");
        }

        const decoded = await verifyToken(token);
        if (!decoded || !decoded.email) {
            throw new Error('Unauthorized user: Invalid token.');
        }

        const adminQuery = await adminDb.collection('admins').where('email', '==', decoded.email).limit(1).get();
        if (adminQuery.empty) {
            throw new Error('Unauthorized user.');
        }

        const adminData = adminQuery.docs[0].data();
        if (adminData.role !== 'super_admin') {
            throw new Error('Insufficient permissions. Only a super admin can change lockout status.');
        }

        return { uid: decoded.uid as string, email: decoded.email };
    } catch (err: any) {
        console.error('Admin session verification failed for security page:', err);
        throw new Error(err.message || "Invalid admin session.");
    }
}


const securitySettingsSchema = z.object({
  adminLocked: z.preprocess((val) => val === 'on', z.boolean()),
  providerLoginsDisabled: z.preprocess((val) => val === 'on', z.boolean()),
  reason: z.string().min(1, { message: 'A reason is required to change lockout status.' }),
});

export async function updateSecuritySettings(prevState: any, formData: FormData) {
  try {
    const adminUser = await getAdminUserForSecurityPage();

    const validatedFields = securitySettingsSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
      return { success: false, errors: validatedFields.error.flatten().fieldErrors };
    }

    const { adminLocked, providerLoginsDisabled, reason } = validatedFields.data;
    
    if (!adminDb) {
        throw new Error("Database not initialized");
    }
    const settingsRef = adminDb.collection('system_settings').doc('admin');
    
    await settingsRef.set({
      adminLocked,
      providerLoginsDisabled,
      reason,
      updatedBy: adminUser.email,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Log both actions
    await logAdminAction({
        adminEmail: adminUser.email!,
        action: adminLocked ? 'SYSTEM_LOCKED' : 'SYSTEM_UNLOCKED',
        targetType: 'system',
        targetId: 'admin_lockout',
        ipAddress,
        userAgent,
    });
    
    await logAdminAction({
        adminEmail: adminUser.email!,
        action: providerLoginsDisabled ? 'PROVIDER_LOGINS_DISABLED' : 'PROVIDER_LOGINS_ENABLED',
        targetType: 'system',
        targetId: 'provider_logins',
        ipAddress,
        userAgent,
    });

    revalidatePath('/admin/settings/security');
    revalidatePath('/admin/audit-logs');

    return { success: true, message: `Security settings have been updated.` };

  } catch (error: any) {
    console.error('Error updating security settings:', error);
    return { success: false, message: error.message || 'Failed to update settings.' };
  }
}
