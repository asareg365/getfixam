'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { adminDb } from './firebase-admin';

const SECRET = process.env.ADMIN_JWT_SECRET || 'this-is-a-super-secret-key-that-should-be-in-an-env-file';

type AdminUser = {
  uid: string;
  email: string | undefined;
  role: string;
}

export async function requireAdmin(): Promise<AdminUser> {
  // CRITICAL: Check for admin lockout first.
  const systemSettingsRef = adminDb.collection('system_settings').doc('admin');
  const systemSettingsSnap = await systemSettingsRef.get();

  if (systemSettingsSnap.exists && systemSettingsSnap.data()?.adminLocked === true) {
      const reason = systemSettingsSnap.data()?.reason || "No reason provided.";
      // Instead of redirecting, we throw an error which will be caught by the error boundary.
      // This is more appropriate for a system-wide lockout.
      throw new Error(`Admin access is temporarily disabled. Reason: ${reason}`);
  }

  const token = cookies().get('admin_token')?.value;
  if (!token) {
    redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    
    if (!decoded.email) {
        throw new Error('Invalid token: email missing.');
    }

    // Re-validate against Firestore to ensure user is still an active admin
    const adminQuery = await adminDb.collection('admins')
        .where('email', '==', decoded.email)
        .where('active', '==', true)
        .limit(1)
        .get();

    if (adminQuery.empty) {
        throw new Error('Unauthorized: Admin not found or inactive.');
    }
    
    const adminData = adminQuery.docs[0].data();

    return {
        uid: decoded.uid as string,
        email: decoded.email,
        role: adminData.role,
    };
  } catch (err) {
    // If token is invalid (expired, tampered), delete the bad cookie and redirect.
    console.error('Admin session verification failed:', err);
    cookies().delete('admin_token');
    redirect('/admin/login');
  }
}

export async function isAdminUser(): Promise<boolean> {
  const token = cookies().get('admin_token')?.value;
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    if (!decoded.email) return false;

    const adminQuery = await adminDb.collection('admins')
        .where('email', '==', decoded.email)
        .where('active', '==', true)
        .limit(1)
        .get();

    return !adminQuery.empty;
  } catch (error) {
    return false;
  }
}

    