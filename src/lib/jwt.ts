'use server';

import { SignJWT, jwtVerify } from 'jose';

// Use a consistent secret for both middleware and server actions
const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'fixam-ghana-secure-fallback-secret-2024';
const key = new TextEncoder().encode(SECRET_KEY);

/**
 * Signs a payload to create a JWT using jose (Edge compatible).
 */
export async function signToken(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(key);
}

/**
 * Verifies a JWT using jose (Edge compatible).
 */
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // Fail silently in logs to avoid clutter, middleware handles redirect
    return null;
  }
}
