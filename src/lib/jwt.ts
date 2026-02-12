'use server';

import { SignJWT, jwtVerify } from 'jose';

// Robust, consistent secret key for cross-portal session verification.
const SECRET_KEY = 'fixam-ghana-v1-stable-security-key-2024-standard-unified-v3';
const key = new TextEncoder().encode(SECRET_KEY);

export type AdminJWTPayload = {
  uid: string;
  email?: string;
  role: 'admin' | 'super_admin';
  portal: 'admin' | 'provider'; 
  exp: number;
  iat: number;
};

export async function signToken(payload: Omit<AdminJWTPayload, 'iat' | 'exp'>): Promise<string> {
  // Defensive check: typeof null is 'object', so we must be explicit.
  if (!payload || typeof payload !== 'object' || payload === null) {
    throw new Error('JWT Payload must be a valid non-null object');
  }

  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(key);
}

export async function verifyToken(token: string): Promise<AdminJWTPayload | null> {
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    return payload as unknown as AdminJWTPayload;
  } catch (error) {
    return null;
  }
}
