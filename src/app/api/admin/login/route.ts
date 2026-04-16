
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // Create the session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json({ success: true });

    // Set the cookie without a fixed domain to support preview environments
    response.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: "/",
      sameSite: "lax",
      maxAge: expiresIn,
    });

    return response;

  } catch (error) {
    console.error("ADMIN SESSION ERROR:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
