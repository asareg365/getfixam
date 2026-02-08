'use server';

import { cookies } from 'next/headers';
import { signToken } from '@/lib/jwt';
import { adminDb } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/audit-log';

/**
 * Establishes a secure admin session.
 */
export async function setAdminSessionAction(uid: string, email: string | null, role: string) {
  if (!email) {
    return { success: false, error: 'Email is required for admin access.' };
  }

  // 1. Generate the token with the REQUIRED portal field
  const token = await signToken({ 
    uid, 
    email, 
    role: role as 'admin' | 'super_admin', 
    portal: 'admin' 
  });
  
  // 2. Set the secure __session cookie (REQUIRED by Firebase Hosting for SSR)
  const cookieStore = await cookies();
  cookieStore.set('__session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 2, // 2 hours
  });

  // 3. Log the login event if possible
  if (adminDb && typeof adminDb.collection === 'function') {
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

  return { success: true };
}
