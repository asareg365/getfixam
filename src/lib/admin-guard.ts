'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from './jwt';

type AdminUser = {
  uid: string;
  email: string | undefined;
  role: 'admin' | 'super_admin';
}

/**
 * Server-side guard to ensure the user is an authorized administrator.
 * Synchronized with proxy.ts logic for total security consistency.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get('__session')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const decoded = await verifyToken(token);
  
  if (!decoded || decoded.portal !== 'admin') {
    cookieStore.delete('__session');
    redirect('/admin/login');
  }

  return {
    uid: decoded.uid,
    email: decoded.email,
    role: decoded.role,
  };
}
