'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession } from '@/app/admin/actions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
        console.error('Server Error: NEXT_PUBLIC_FIREBASE_API_KEY is not set.');
        return NextResponse.json({ success: false, error: 'Server configuration error.' }, { status: 500 });
    }
    
    // Use the Firebase Auth REST API to sign in with email and password
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
        }),
    });

    const authData = await res.json();

    if (!res.ok) {
        // Forward the error from Firebase Auth API
        const errorMessage = authData.error?.message === 'INVALID_LOGIN_CREDENTIALS'
            ? 'Invalid email or password.'
            : 'An authentication error occurred.';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 401 });
    }
    
    const { idToken } = authData;

    if (!idToken) {
        return NextResponse.json({ success: false, error: 'Could not retrieve authentication token.' }, { status: 500 });
    }

    // Use the existing action to verify the token and create a session cookie
    const result = await createAdminSession(idToken);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }
  } catch (error: any) {
    console.error("Error in admin login API route:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server error during login process.' }, { status: 500 });
  }
}
