'use server';

import { cookies } from 'next/headers';
import { signToken } from '@/lib/jwt';
import { adminDb } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/audit-log';

/**
 * Establishes a secure admin session by setting an encrypted cookie.
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
    
    // Check environment: Studio/Dev environments may use HTTP locally
    const isProd = process.env.NODE_ENV === 'production';

    // Set the __session cookie (required name for Firebase App Hosting)
    cookieStore.set('__session', token, {
      httpOnly: true,
      secure: isProd, // Only true in production to avoid issues in dev previews
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Log the successful login event if DB is available
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
