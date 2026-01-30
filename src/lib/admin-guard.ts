'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt, { type JwtPayload } from 'jsonwebtoken';

const SECRET = process.env.ADMIN_JWT_SECRET || 'this-is-a-super-secret-key-that-should-be-in-an-env-file';

type AdminUser = {
  uid: string;
  email: string | undefined;
}

export async function requireAdmin(): Promise<AdminUser> {
  const token = cookies().get('admin_token')?.value;
  if (!token) {
    redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    
    // The token contains the user's email, which we verified on login.
    // We double-check it here as an extra layer of security.
    if (decoded.email?.toLowerCase() !== 'asareg365@gmail.com') {
      throw new Error('Unauthorized user: Invalid email in token.');
    }
    return {
        uid: decoded.uid as string,
        email: decoded.email
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
    return decoded.email?.toLowerCase() === 'asareg365@gmail.com';
  } catch (error) {
    return false;
  }
}
