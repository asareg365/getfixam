'use server';

import { cookies } from 'next/headers';
import { signToken } from '@/lib/jwt';
import { logAdminAction } from '@/lib/audit-log';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Server action to create a secure session cookie for an authenticated admin.
 * This is the crucial step that bridges Firebase client-side auth with the server-side session.
 */
export async function setAdminSessionAction(uid: string, email: string, role: string) {
  try {
    const cookieStore = cookies();
    const cookieDomain = process.env.NODE_ENV === 'production' ? '.getfixam.com' : undefined;

    // 1. Generate a custom JWT containing essential user info
    const token = await signToken({
      uid,
      email,
      role: role as 'admin' | 'super_admin',
      portal: 'admin',
    });

    // 2. Set the token in a secure, HTTP-only cookie
    cookieStore.set('__session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      sameSite: 'lax',
      domain: cookieDomain,
    });

    // Log the successful login event
    if (adminDb) {
      try {
        await logAdminAction({
            adminEmail: email,
            action: 'ADMIN_LOGIN_SUCCESS',
            targetType: 'system',
            targetId: uid,
            ipAddress: 'server-action', // Note: IP from server action is less reliable
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
