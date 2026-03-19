'use server';

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

type ActionResult = { success: true } | { success: false; error: string };

export async function setAdminSessionAction(idToken: string): Promise<ActionResult> {
  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    (await cookies()).set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn / 1000,
      path: "/",
      sameSite: 'lax',
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Session creation error:', error);
    return { success: false, error: 'Failed to create session.' };
  }
}
