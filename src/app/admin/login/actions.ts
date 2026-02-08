'use server';

import { cookies } from 'next/headers';
import { signToken } from '@/lib/jwt';

/**
 * Creates a secure session cookie for an authenticated admin.
 * This is called from the client-side login page after Firebase Auth succeeds.
 */
export async function setAdminSessionAction(uid: string, email: string, role: string) {
  try {
    // REQUIRED: Add 'portal: admin' to payload so middleware can distinguish sessions.
    const token = await signToken({ 
      uid, 
      email, 
      role, 
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

    return { success: true };
  } catch (error) {
    console.error('Error setting admin session:', error);
    return { success: false, error: 'Failed to establish session.' };
  }
}

/**
 * Legacy function - kept for compatibility if needed elsewhere, 
 * but the app now prefers client-side auth + setAdminSessionAction.
 */
export async function loginWithEmailAndPassword(email: string, password: string) {
    return { error: 'Please use the standard login form.' };
}
