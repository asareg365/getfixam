import { adminAuth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
        return NextResponse.json({ success: false, error: 'ID token is required.' }, { status: 400 });
    }

    if (!adminAuth) {
        return NextResponse.json({ success: false, error: 'Auth service not initialized' }, { status: 500 });
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ success: true });
    
    // secure: false ensures compatibility with the http://localhost:9002 preview environment.
    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: false,
      maxAge: expiresIn,
      sameSite: 'lax',
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Session Login Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create session.' }, { status: 500 });
  }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('__session');
    return response;
}
