import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    // Verify Firebase ID token
    await adminAuth.verifyIdToken(idToken);

    // 5 days in milliseconds for Firebase session
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(
      idToken,
      { expiresIn }
    );

    const response = NextResponse.json({
      success: true,
    });

    // Set secure session cookie
    // Removed hardcoded domain to ensure compatibility across different environments (Studio, Staging, Production)
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
