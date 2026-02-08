'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from './jwt';
import { adminDb } from './firebase-admin';

type AdminUser = {
  uid: string;
  email: string | undefined;
  role: 'admin' | 'super_admin';
}

/**
 * Server-side guard to ensure the user is an authorized administrator.
 * Synchronized with proxy.ts logic.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get('__session')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const decoded = await verifyToken(token);
  
  // Strict portal and role check
  if (!decoded || decoded.portal !== 'admin') {
    cookieStore.delete('__session');
    redirect('/admin/login');
  }

  // Return user info from verified token payload
  return {
    uid: decoded.uid,
    email: decoded.email,
    role: decoded.role,
  };
}
