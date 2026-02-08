import { NextRequest, NextResponse } from 'next/server';

// Corrected signature based on the new, specific type error.
export async function POST(req: NextRequest, context: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await context.params; // Await the params promise
    return NextResponse.json({ success: true, action: action });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to resolve params' });
  }
}
