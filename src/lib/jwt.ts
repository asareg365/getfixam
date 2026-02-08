'use server';

import { SignJWT, jwtVerify } from 'jose';

// We use a stable, consistent secret for token signing. 
// In a production environment, this should be a complex environment variable.
const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'fixam-ghana-secure-stable-key-2024-v1';

export type AdminJWTPayload = {
  uid: string;
  email?: string;
  role: 'admin' | 'super_admin';
  portal: 'admin';
  exp?: number;
  iat?: number;
};

/**
 * Signs a payload to create a JWT using jose (Edge compatible).
 */
export async function signToken(payload: AdminJWTPayload): Promise<string> {
  const key = new TextEncoder().encode(SECRET_KEY);
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
    const key = new TextEncoder().encode(SECRET_KEY);
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    return payload as unknown as AdminJWTPayload;
  } catch (error) {
    // Silently fail verification to allow middleware to handle the redirect logic
    return null;
  }
}
