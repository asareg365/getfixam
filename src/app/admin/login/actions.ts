'use server';

import { cookies } from 'next/headers';
import { signToken } from '@/lib/jwt';

/**
 * Sets the admin session cookie after the client has verified the user's admin status.
 */
export async function setAdminSessionAction(uid: string, email: string, role: string) {
  const token = await signToken({ uid, email, role });

  const cookieStore = await cookies();
  
  // Set the cookie with a standard set of security flags
  cookieStore.set({
    name: 'admin_token',
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 2, // 2 hours
  });

  return { success: true };
}
