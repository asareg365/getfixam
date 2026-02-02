'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { logAdminAction } from '@/lib/audit-log';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';
import jwt, { type JwtPayload } from 'jsonwebtoken';

const SECRET = process.env.ADMIN_JWT_SECRET || 'this-is-a-super-secret-key-that-should-be-in-an-env-file';

// A custom function to get admin user without the lockout check. For this page only.
async function getAdminUserForSecurityPage(): Promise<{ uid: string; email: string | undefined; }> {
    const token = cookies().get('admin_token')?.value;
    if (!token) throw new Error("Authentication required.");

    try {
        const decoded = jwt.verify(token, SECRET) as JwtPayload;
        if (!decoded.email) {
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


const lockoutSchema = z.object({
  adminLocked: z.preprocess((val) => val === 'on', z.boolean()),
  reason: z.string().min(1, { message: 'A reason is required to change lockout status.' }),
});

export async function updateLockoutStatus(prevState: any, formData: FormData) {
  try {
    const adminUser = await getAdminUserForSecurityPage();

    const validatedFields = lockoutSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
      return { success: false, errors: validatedFields.error.flatten().fieldErrors };
    }

    const { adminLocked, reason } = validatedFields.data;
    
    const settingsRef = adminDb.collection('system_settings').doc('admin');
    
    await settingsRef.set({
      adminLocked,
      reason,
      updatedBy: adminUser.email,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    
    const headersList = headers();
    await logAdminAction({
        adminEmail: adminUser.email!,
        action: adminLocked ? 'SYSTEM_LOCKED' : 'SYSTEM_UNLOCKED',
        targetType: 'system',
        targetId: 'admin_lockout',
        ipAddress: headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        userAgent: headersList.get('user-agent') || 'unknown',
    });

    revalidatePath('/admin/settings/security');
    revalidatePath('/admin/audit-logs');

    return { success: true, message: `Admin access has been ${adminLocked ? 'DISABLED' : 'ENABLED'}.` };

  } catch (error: any) {
    console.error('Error updating lockout status:', error);
    return { success: false, message: error.message || 'Failed to update status.' };
  }
}

    