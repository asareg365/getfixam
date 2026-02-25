
import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

// This is a temporary route to generate an admin session cookie.
// It should be deleted after the one-time migration is complete.
export async function GET() {
  const auth = getAdminAuth();
  
  // IMPORTANT: This UID must correspond to a user you have designated as an admin.
  const adminUid = '8YvzSpEGjKUVhJdu1RZZ0yywkkA3'; 
  const expiresIn = 60 * 60 * 1000; // 1 hour

  try {
    // The middleware requires a 'portal: admin' claim for admin routes.
    await auth.setCustomUserClaims(adminUid, { portal: 'admin' });

    // Create the session cookie.
    const sessionCookie = await auth.createSessionCookie(adminUid, { expiresIn });

    // Return the cookie in the response body.
    return NextResponse.json({ success: true, cookie: sessionCookie });
  } catch (error: any) {
    console.error('Error creating admin session cookie:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
