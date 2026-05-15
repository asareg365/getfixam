import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    // 1. Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Universal Admin Check: Ensure role claim is present if user is an admin
    // This solves the issue of new admins being redirected because they lack the claim
    const adminDoc = await adminDb.collection('admins').doc(uid).get();
    
    if (adminDoc.exists && adminDoc.data()?.active) {
        const claims = decodedToken.role;
        if (claims !== 'admin' && claims !== 'super_admin') {
            await adminAuth.setCustomUserClaims(uid, { role: 'admin' });
        }
    } else {
        return NextResponse.json({ error: "Forbidden: Not an active administrator." }, { status: 403 });
    }

    // 3. Create session cookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(
      idToken,
      { expiresIn }
    );

    const response = NextResponse.json({
      success: true,
    });

    // 4. Set secure session cookie
    response.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 5, // seconds
    });

    return response;
  } catch (error) {
    console.error("ADMIN SESSION ERROR:", error);
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
