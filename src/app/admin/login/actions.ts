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
    
    /**
     * CRITICAL: Set __session cookie. 
     * In modern browsers and proxied environments (like Studio or App Hosting),
     * 'secure: true' is required for reliable session persistence over HTTPS.
     */
    cookieStore.set('__session', token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Log the successful login event
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
      } catch (logErr) {
        // Log error ignored to prevent login blockage
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to set admin session:', err);
    return { success: false, error: 'Failed to establish security session.' };
  }
}
