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

  try {
    // 1. Generate the token with the REQUIRED portal field
    const token = await signToken({ 
      uid, 
      email, 
      role: role as 'admin' | 'super_admin', 
      portal: 'admin' 
    });
    
    // 2. Set the secure __session cookie
    // Firebase Hosting requires '__session' for server-side cookie access.
    const cookieStore = await cookies();
    cookieStore.set('__session', token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 2, // 2 hours
    });

    // 3. Log the login event if database is available
    if (adminDb) {
      logAdminAction({
          adminEmail: email,
          action: 'ADMIN_LOGIN_SUCCESS',
          targetType: 'system',
          targetId: uid,
          ipAddress: 'server-action',
          userAgent: 'server-action',
      }).catch(() => {});
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to set admin session:', err);
    return { success: false, error: 'Failed to establish security session.' };
  }
}
