'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from './firebase-admin';

type AdminUser = {
  uid: string;
  email: string | undefined;
  role: 'admin' | 'super_admin';
}

/**
 * Server-side guard to ensure the user is an authorized administrator.
 * This is used inside Server Components to verify the session.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get('__session')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const decodedToken = await adminAuth.verifySessionCookie(token, true);
  
  if (!decodedToken) {
    console.log('[AdminGuard] Invalid or non-admin session detected.');
    cookieStore.delete('__session');
    redirect('/admin/login');
  }

  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
    role: decodedToken.role as 'admin' | 'super_admin',
  };
}
