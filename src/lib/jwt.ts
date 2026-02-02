'use server';

import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'this-is-a-super-secret-key-that-should-be-in-an-env-file';
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
    return null;
  }
}
