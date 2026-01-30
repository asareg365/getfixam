'use server';

import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    // Only allow the designated admin email
    if (email.toLowerCase() !== 'asareg365@gmail.com') {
        return NextResponse.json({ success: false, message: 'You are not authorized to access the admin panel.' }, { status: 403 });
    }

    // Use Firebase Auth REST API to verify password. This is more secure than
    // using the Admin SDK to fetch user data and comparing passwords manually.
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
    
    // If Firebase auth is successful, create our own session JWT
    const { localId, email: userEmail } = authData;
    const token = await signToken({ uid: localId, email: userEmail });

    const response = NextResponse.json({ success: true, message: 'Login successful' });
    
    response.cookies.set({
      name: 'adminSession', // This is the cookie our middleware and guards will look for
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
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
