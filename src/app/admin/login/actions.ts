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
    // 1. Generate the token with the portal: 'admin' field
    const token = await signToken({ 
      uid, 
      email, 
      role: role as 'admin' | 'super_admin', 
      portal: 'admin' 
    });
    
    // 2. Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set('__session', token, {
      httpOnly: true,
      // For development in proxies/workstations, we set secure to false
      // to ensure the browser accepts the cookie over non-HTTPS local links.
      secure: false, 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 2, // 2 hours
    });

    // 3. Log the login event defensively
    if (adminDb && typeof adminDb.collection === 'function') {
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
