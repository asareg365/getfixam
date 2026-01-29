'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession } from '@/app/admin/actions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ success: false, error: 'ID token is missing.' }, { status: 400 });
    }

    const result = await createAdminSession(idToken);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }
  } catch (error: any) {
    console.error("Error in admin login API route:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server error during token verification.' }, { status: 500 });
  }
}
