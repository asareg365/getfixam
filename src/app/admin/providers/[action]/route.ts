import { NextResponse } from 'next/server';

/**
 * DEPRECATED: Moderate providers directly via client-side SDK to avoid environment-specific 
 * admin initialization issues. This handler is neutralized to stop 500 errors.
 */
export async function POST() {
  return NextResponse.json({ 
    success: false, 
    error: 'This action is now performed client-side. Please refresh your dashboard.' 
  }, { status: 410 });
}
