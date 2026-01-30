'use server';

import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    if (email.toLowerCase() !== 'asareg365@gmail.com') {
      return NextResponse.json({ success: false, message: 'You are not authorized to access the admin panel.' }, { status: 401 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      console.error('Server Error: NEXT_PUBLIC_FIREBASE_API_KEY is not set.');
      return NextResponse.json({ success: false, message: 'Server configuration error.' }, { status: 500 });
    }
    
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const authData = await res.json();

    if (!res.ok) {
      const errorMessage = authData.error?.message === 'INVALID_LOGIN_CREDENTIALS'
        ? 'Invalid email or password.'
        : 'An authentication error occurred.';
      return NextResponse.json({ success: false, message: errorMessage }, { status: 401 });
    }
    
    const idToken = authData.idToken;
    const response = NextResponse.json({ success: true, message: 'Login successful' });
    const expires = new Date();
    expires.setHours(expires.getHours() + 2);

    response.cookies.set({
      name: 'adminSession',
      value: idToken,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires,
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
