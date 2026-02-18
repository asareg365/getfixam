
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
    const token = await signToken({ 
      uid, 
      email, 
      role: role as 'admin' | 'super_admin', 
      portal: 'admin' 
    });
    
    const cookieStore = await cookies();
    
    // Always use secure cookies in production environments
    const isProd = process.env.NODE_ENV === 'production';

    cookieStore.set('__session', token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

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
