'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signToken } from '@/lib/jwt';
import { adminDb } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/audit-log';

/**
 * Establishes a secure admin session.
 * In a prototyping environment where adminDb might be null, we rely on the 
 * client-side verification and provisioning logic.
 */
export async function setAdminSessionAction(uid: string, email: string | null, role: string) {
  if (!email) {
    return { success: false, error: 'Email is required for admin access.' };
  }

  // In a production environment with adminDb, we would double-check the role here.
  // For now, we trust the role passed from the client-side login logic which
  // handles auto-provisioning of the first admin.

  const token = await signToken({ 
    uid, 
    email, 
    role: role as 'admin' | 'super_admin', 
    portal: 'admin' 
  });
  
  const cookieStore = await cookies();
  cookieStore.set('__session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 2, // 2 hours
  });

  // Log the login event if possible
  if (adminDb) {
    try {
        await logAdminAction({
            adminEmail: email,
            action: 'ADMIN_LOGIN_SUCCESS',
            targetType: 'system',
            targetId: uid,
            ipAddress: 'server-action',
            userAgent: 'server-action',
        });
    } catch (e) {
        console.warn("Failed to log admin login event.");
    }
  }

  // Redirect to dashboard
  redirect('/admin');
}
