'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';

type AdminUser = {
  uid: string;
  email: string;
}

export async function requireAdmin(): Promise<AdminUser> {
  const token = cookies().get('adminSession')?.value;
  if (!token) {
    redirect('/admin/login');
  }

  try {
    const decoded = verifyToken<AdminUser>(token); // throws if invalid or expired
    if (decoded.email.toLowerCase() !== 'asareg365@gmail.com') {
      throw new Error('Unauthorized user');
    }
    return decoded;
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
    const decoded = verifyToken(token);
    return decoded.email.toLowerCase() === 'asareg365@gmail.com';
  } catch (error) {
    return false;
  }
}
