'use server';

import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/jwt';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { logAdminAction } from '@/lib/audit-log';

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MINUTES = 10;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const attemptRef = adminDb.collection('admin_login_attempts').doc(ip);
  
  try {
    const attemptSnap = await attemptRef.get();

    if (attemptSnap.exists) {
      const data = attemptSnap.data()!;
      if (data.blockedUntil && data.blockedUntil.toDate() > new Date()) {
        const timeLeft = Math.ceil((data.blockedUntil.toDate().getTime() - new Date().getTime()) / 60000);
        return NextResponse.json({ success: false, message: `Too many failed attempts. Please try again in ${timeLeft} minutes.` }, { status: 429 });
      }
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }
    
    // Log failed attempt if it's not the admin email, but don't give away that the email is wrong.
    if (email.toLowerCase() !== 'asareg365@gmail.com') {
        await logAdminAction({ adminEmail: email, action: 'ADMIN_LOGIN_FAILED', targetType: 'system', targetId: email, ipAddress: ip, userAgent });
        return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      console.error('Server Error: NEXT_PUBLIC_FIREBASE_API_KEY is not set.');
      throw new Error('Server configuration error.');
    }
    
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const authData = await res.json();

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
      
      return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
    }
    
    if (attemptSnap.exists) {
      await attemptRef.delete();
    }

    const { localId, email: userEmail } = authData;
    const token = await signToken({ uid: localId, email: userEmail });

    const response = NextResponse.json({ success: true, message: 'Login successful' });
    
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 2, // 2 hours
    });

    await logAdminAction({ adminEmail: userEmail, action: 'ADMIN_LOGIN_SUCCESS', targetType: 'system', targetId: userEmail, ipAddress: ip, userAgent });

    return response;

  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
