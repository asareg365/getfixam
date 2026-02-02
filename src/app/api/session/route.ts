import { adminAuth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Creates a server-side session cookie from a client-side ID token.
 */
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
        return NextResponse.json({ success: false, error: 'ID token is required.' }, { status: 400 });
    }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json({ success: true });
    
    // Set the cookie on the response with httpOnly and other security flags.
    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      sameSite: 'strict',
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Session Login Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create session.' }, { status: 500 });
  }
}

/**
 * Logs the user out by clearing the session cookie.
 */
export async function DELETE(req: NextRequest) {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('__session');
    return response;
}
