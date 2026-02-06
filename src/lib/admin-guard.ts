'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from './jwt';
import { adminDb } from './firebase-admin';

type AdminUser = {
  uid: string;
  email: string | undefined;
  role: string;
}

export async function requireAdmin(): Promise<AdminUser> {
  // CRITICAL: Check for admin lockout first.
  if (adminDb && typeof adminDb.collection === 'function') {
    try {
        const systemSettingsRef = adminDb.collection('system_settings').doc('admin');
        const systemSettingsSnap = await systemSettingsRef.get();

        if (systemSettingsSnap.exists && systemSettingsSnap.data()?.adminLocked === true) {
            const reason = systemSettingsSnap.data()?.reason || "No reason provided.";
            throw new Error(`Admin access is temporarily disabled. Reason: ${reason}`);
        }
    } catch (e) {
        // Safe fallback for build time
        console.warn("System settings check bypassed.");
    }
  }

  const token = (await cookies()).get('admin_token')?.value;
  if (!token) {
    redirect('/admin/login');
  }

  const decoded = await verifyToken(token);
  
  if (!decoded || !decoded.email) {
    console.error('Admin session verification failed or token expired.');
    (await cookies()).delete('admin_token');
    redirect('/admin/login');
  }

  // Re-validate against Firestore if DB is available
  if (adminDb && typeof adminDb.collection === 'function') {
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
        email: decoded.email as string,
        role: adminData.role,
    };
  }

  // Fallback for build time if token is present but DB isn't initialized yet
  return {
    uid: decoded.uid as string,
    email: decoded.email as string,
    role: (decoded.role as string) || 'admin',
  };
}

export async function isAdminUser(): Promise<boolean> {
  const token = (await cookies()).get('admin_token')?.value;
  if (!token) return false;

  const decoded = await verifyToken(token);
  if (!decoded || !decoded.email) return false;

  if (adminDb && typeof adminDb.collection === 'function') {
    const adminQuery = await adminDb.collection('admins')
        .where('email', '==', decoded.email)
        .where('active', '==', true)
        .limit(1)
        .get();

    return !adminQuery.empty;
  }
  
  return true;
}
