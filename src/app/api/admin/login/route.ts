'use server';

import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/jwt';
import { admin } from '@/lib/firebase-admin';

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MINUTES = 10;

export async function POST(req: NextRequest) {
  // Use `x-forwarded-for` for environments like Vercel/App Hosting, fallback to `ip`
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';

  const attemptRef = admin.firestore().collection('admin_login_attempts').doc(ip);
  
  try {
    const attemptSnap = await attemptRef.get();

    // 1. Check if IP is currently blocked
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

    if (email.toLowerCase() !== 'asareg365@gmail.com') {
        return NextResponse.json({ success: false, message: 'You are not authorized to access the admin panel.' }, { status: 403 });
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

    // --- On Login Failure ---
    if (!res.ok) {
      const currentCount = attemptSnap.data()?.count || 0;
      const isBlocked = (currentCount + 1) >= MAX_ATTEMPTS;

      const updateData: { [key: string]: any } = {
        count: admin.firestore.FieldValue.increment(1),
        lastAttempt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (isBlocked) {
        const blockUntilDate = new Date();
        blockUntilDate.setMinutes(blockUntilDate.getMinutes() + BLOCK_DURATION_MINUTES);
        updateData.blockedUntil = blockUntilDate;
      }
      
      await attemptRef.set(updateData, { merge: true });
      
      const errorMessage = authData.error?.message === 'INVALID_LOGIN_CREDENTIALS'
        ? 'Invalid email or password.'
        : 'An authentication error occurred.';
      return NextResponse.json({ success: false, message: errorMessage }, { status: 401 });
    }
    
    // --- On Login Success ---
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

    return response;

  } catch (error: any) {
    console.error('Login API error:', error);
    // This will catch JSON parsing errors or other unexpected issues
    // We still log the attempt, but we don't block based on this kind of error
    // to avoid potential DOS by sending malformed requests.
    return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
