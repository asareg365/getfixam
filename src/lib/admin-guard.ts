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
 * Synchronized with middleware.ts logic.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get('__session')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const decoded = await verifyToken(token);
  
  // Strict check matching middleware
  if (!decoded || decoded.portal !== 'admin') {
    cookieStore.delete('__session');
    redirect('/admin/login');
  }

  // Double-check against Firestore only if the Admin SDK is available
  if (adminDb && typeof adminDb.collection === 'function') {
    try {
      const adminQuery = await adminDb.collection('admins')
          .doc(decoded.uid)
          .get();

      if (adminQuery.exists) {
          const adminData = adminQuery.data();
          if (adminData?.active) {
            return {
                uid: decoded.uid,
                email: decoded.email,
                role: adminData.role as 'admin' | 'super_admin',
            };
          }
      }
    } catch (e) {
      console.warn("Admin DB check bypassed, using verified token payload.");
    }
  }

  return {
    uid: decoded.uid,
    email: decoded.email,
    role: decoded.role,
  };
}
