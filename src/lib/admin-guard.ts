'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';
import type { JwtPayload } from 'jsonwebtoken';

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
    const decoded = await verifyToken<JwtPayload>(token);
    
    // The token contains the user's email, which we verified on login.
    // We double-check it here as an extra layer of security.
    if (decoded.email?.toLowerCase() !== 'asareg365@gmail.com') {
      throw new Error('Unauthorized user: Invalid email in token.');
    }
    return {
        uid: decoded.uid,
        email: decoded.email
    };
  } catch (err) {
    // If token is invalid (expired, tampered), delete the bad cookie and redirect.
    console.error('Admin session verification failed:', err);
    cookies().delete('adminSession');
    redirect('/admin/login');
  }
}

export async function isAdminUser(): Promise<boolean> {
  const token = cookies().get('adminSession')?.value;
  if (!token) return false;

  try {
    const decoded = await verifyToken<JwtPayload>(token);
    return decoded.email?.toLowerCase() === 'asareg365@gmail.com';
  } catch (error) {
    return false;
  }
}
