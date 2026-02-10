// This file is disabled to allow src/proxy.ts to handle all routing as required by the server.
import { NextResponse } from 'next/server';
export function middleware() {
  return NextResponse.next();
}
export const config = { matcher: [] };
