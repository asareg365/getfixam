'use server';

import { SignJWT, jwtVerify } from 'jose';

// Stable secret for prototyping environments. In production, this should be a strong env var.
const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'fixam-ghana-secure-stable-key-2024-v1';
const key = new TextEncoder().encode(SECRET_KEY);

export type AdminJWTPayload = {
  uid: string;
  email?: string;
  role: 'admin' | 'super_admin';
  portal: 'admin'; // REQUIRED to distinguish from provider sessions
  exp?: number;
  iat?: number;
};

/**
 * Signs a payload to create a secure Admin JWT.
 */
export async function signToken(payload: Omit<AdminJWTPayload, 'iat' | 'exp'>): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(key);
}

/**
 * Verifies an Admin JWT and returns the typed payload or null.
 */
export async function verifyToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    // Cast and validate portal field
    const adminPayload = payload as unknown as AdminJWTPayload;
    if (adminPayload.portal !== 'admin') return null;

    return adminPayload;
  } catch (error) {
    return null;
  }
}
