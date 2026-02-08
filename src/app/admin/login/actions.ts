'use server';

import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { logAdminAction } from '@/lib/audit-log';
import { signToken } from '@/lib/jwt';

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MINUTES = 10;

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, 'Password is required.'),
});

export async function loginAction(prevState: any, formData: FormData) {
  console.log('Admin login endpoint reached'); // DEBUG LOG
  if (!adminDb) {
    throw new Error('Database not initialized');
  }
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = headerList.get('user-agent') || 'unknown';
  const attemptRef = adminDb.collection('admin_login_attempts').doc(ip);

  try {
    const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
      return { success: false, errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { email, password } = validatedFields.data;

    const attemptSnap = await attemptRef.get();

    if (attemptSnap.exists) {
      const data = attemptSnap.data()!;
      if (data.blockedUntil && data.blockedUntil.toDate() > new Date()) {
        const timeLeft = Math.ceil((data.blockedUntil.toDate().getTime() - new Date().getTime()) / 60000);
        return { success: false, message: `Too many failed attempts. Please try again in ${timeLeft} minutes.` };
      }
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      console.error('Server Error: NEXT_PUBLIC_FIREBASE_API_KEY is not set.');
      return { success: false, message: 'Server configuration error.' };
    }
    
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const responseText = await res.text();
    const authData = responseText ? JSON.parse(responseText) : null;

    if (!res.ok) {
      const currentCount = attemptSnap.data()?.count || 0;
      const isBlocked = (currentCount + 1) >= MAX_ATTEMPTS;

      const updateData: { [key: string]: any } = {
        count: FieldValue.increment(1),
        lastAttempt: FieldValue.serverTimestamp(),
      };

      if (isBlocked) {
        const blockUntilDate = new Date();
        blockUntilDate.setMinutes(blockUntilDate.getMinutes() + BLOCK_DURATION_MINUTES);
        updateData.blockedUntil = blockUntilDate;
      }
      
      await attemptRef.set(updateData, { merge: true });
      await logAdminAction({ adminEmail: email, action: 'ADMIN_LOGIN_FAILED', targetType: 'system', targetId: email, ipAddress: ip, userAgent });
      
      return { success: false, message: 'Invalid credentials.' };
    }
    
    if (!authData) {
        return { success: false, message: 'Authentication server returned an empty response.' };
    }

    const { localId, email: userEmail } = authData;
    const adminQuery = await adminDb.collection('admins').where('email', '==', userEmail).limit(1).get();

    if (adminQuery.empty) {
      await logAdminAction({ adminEmail: userEmail, action: 'ADMIN_LOGIN_FAILED', targetType: 'system', targetId: userEmail, ipAddress: ip, userAgent });
      return { success: false, message: 'Invalid credentials.' };
    }

    const adminData = adminQuery.docs[0].data();

    if (adminData.active !== true) {
        await logAdminAction({ adminEmail: userEmail, action: 'ADMIN_LOGIN_FAILED', targetType: 'system', targetId: userEmail, ipAddress: ip, userAgent });
        return { success: false, message: 'Your administrator account is inactive.' };
    }

    if (attemptSnap.exists) {
      await attemptRef.delete();
    }

    const token = await signToken({ uid: localId, email: userEmail, role: adminData.role });

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 2, // 2 hours
    });

    await logAdminAction({ adminEmail: userEmail, action: 'ADMIN_LOGIN_SUCCESS', targetType: 'system', targetId: userEmail, ipAddress: ip, userAgent });
    
    return { success: true };

  } catch (error: any) {
    console.error('ADMIN LOGIN ERROR:', error);
    return { success: false, message: error.message || 'An unexpected server error occurred.' };
  }
}
