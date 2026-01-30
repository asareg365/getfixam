'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { admin } from '@/lib/firebase-admin';

type AdminUser = {
  uid: string;
  email: string | undefined;
}

export async function requireAdmin(): Promise<AdminUser> {
  const token = cookies().get('adminSession')?.value;
  if (!token) {
    redirect('/admin/login');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (decodedToken.email?.toLowerCase() !== 'asareg365@gmail.com') {
      throw new Error('Unauthorized user');
    }
    return {
        uid: decodedToken.uid,
        email: decodedToken.email
    };
  } catch (err) {
    // If token is invalid, delete the bad cookie and redirect
    cookies().delete('adminSession');
    redirect('/admin/login');
  }
}

export async function isAdminUser(): Promise<boolean> {
  const token = cookies().get('adminSession')?.value;
  if (!token) return false;

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.email?.toLowerCase() === 'asareg365@gmail.com';
  } catch (error) {
    return false;
  }
}
