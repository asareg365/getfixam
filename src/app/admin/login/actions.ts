'use server';

import { cookies } from 'next/headers';
import { signToken } from '@/lib/jwt';

/**
 * Sets the admin session cookie after the client has verified the user's admin status.
 * CRITICAL: Uses '__session' name required by Firebase Hosting.
 */
export async function setAdminSessionAction(uid: string, email: string, role: string) {
  const token = await signToken({ uid, email, role });

  const cookieStore = await cookies();
  
  cookieStore.set({
    name: '__session', // Required name for Firebase Hosting compatibility
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 2, // 2 hours
  });

  return { success: true };
}
