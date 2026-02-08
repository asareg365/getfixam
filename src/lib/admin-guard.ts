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
 * Used inside Server Components and Server Actions.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get('__session')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const decoded = await verifyToken(token);
  
  // Basic token validation matching middleware logic
  if (!decoded || decoded.portal !== 'admin') {
    cookieStore.delete('__session');
    redirect('/admin/login');
  }

  // Double-check against Firestore if the Admin SDK is available
  if (adminDb && typeof adminDb.collection === 'function') {
    try {
      const adminQuery = await adminDb.collection('admins')
          .where('email', '==', decoded.email)
          .where('active', '==', true)
          .limit(1)
          .get();

      if (adminQuery.empty) {
          cookieStore.delete('__session');
          redirect('/admin/login');
      }
      
      const adminData = adminQuery.docs[0].data();

      return {
          uid: decoded.uid,
          email: decoded.email,
          role: adminData.role as 'admin' | 'super_admin',
      };
    } catch (e) {
      console.warn("Admin DB check failed, using JWT claims.");
    }
  }

  return {
    uid: decoded.uid,
    email: decoded.email,
    role: decoded.role,
  };
}

export async function isAdminUser(): Promise<boolean> {
  const token = (await cookies()).get('__session')?.value;
  if (!token) return false;

  const decoded = await verifyToken(token);
  if (!decoded || decoded.portal !== 'admin') return false;

  return true;
}
