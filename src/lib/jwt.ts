'use server';

import { SignJWT, jwtVerify } from 'jose';

// Use a consistent secret for both middleware and server actions
const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'fixam-ghana-secure-fallback-secret-2024';
const key = new TextEncoder().encode(SECRET_KEY);

export type AdminJWTPayload = {
  uid: string;
  email?: string;
  role: 'admin' | 'super_admin';
  portal: 'admin'; // 🔑 REQUIRED to distinguish from other session types
  exp?: number;
  iat?: number;
};

/**
 * Signs a payload to create a JWT using jose (Edge compatible).
 */
export async function signToken(payload: AdminJWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(key);
}

/**
 * Verifies a JWT using jose (Edge compatible).
 */
export async function verifyToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    console.log('JWT payload:', payload);
    return payload as unknown as AdminJWTPayload;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}
