'use server';

import { SignJWT, jwtVerify } from 'jose';

/**
 * HARDENED SECRET KEY
 * Standardized secret for consistent session verification across server actions and proxy.
 */
const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'fixam-ghana-v1-stable-security-key-2024-unified-portal-robust-v2';
const key = new TextEncoder().encode(SECRET_KEY);

export type AdminJWTPayload = {
  uid: string;
  email?: string;
  role: 'admin' | 'super_admin';
  portal: 'admin' | 'provider'; 
  exp: number;
  iat: number;
};

/**
 * Signs a payload to create a secure administrative JWT.
 */
export async function signToken(payload: Omit<AdminJWTPayload, 'iat' | 'exp'>): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(key);
}

/**
 * Verifies a JWT and returns the typed payload or null if invalid.
 */
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
