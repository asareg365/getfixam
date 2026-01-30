'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { admin } from '@/lib/firebase-admin';

export async function requireAdmin() {
  const token = cookies().get('adminSession')?.value;
  if (!token) redirect('/admin/login');

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    if (decoded.email?.toLowerCase() !== 'asareg365@gmail.com') {
      redirect('/admin/login');
    }
  } catch (error) {
    console.error('Admin auth failed:', error);
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
    // Not a critical error for a public page check, so we can ignore it.
    return false;
  }
}
