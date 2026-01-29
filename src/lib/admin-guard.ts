'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase-admin';

export async function requireAdmin() {
  const token = cookies().get('adminSession')?.value;
  if (!token) redirect('/admin/login');

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.email?.toLowerCase() !== 'asareg365@gmail.com') {
      redirect('/admin/login');
    }
  } catch (error) {
    console.error('Admin auth failed:', error);
    redirect('/admin/login');
  }
}
