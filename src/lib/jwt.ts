'use server';

import { SignJWT, jwtVerify } from 'jose';

// Stable secret for prototyping environments.
const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'fixam-ghana-secure-stable-key-2024-v1';
const key = new TextEncoder().encode(SECRET_KEY);

export type AdminJWTPayload = {
  uid: string;
  email?: string;
  role: 'admin' | 'super_admin';
  portal: 'admin'; // REQUIRED to distinguish from provider sessions
  exp: number;
  iat: number;
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

    const adminPayload = payload as unknown as AdminJWTPayload;
    
    // Explicitly check for the admin portal claim
    if (adminPayload.portal !== 'admin') {
        console.warn('JWT Verification failed: Invalid portal claim.');
        return null;
    }

    return adminPayload;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}
