'use server';

import { SignJWT, jwtVerify } from 'jose';

/**
 * HARDENED SECRET KEY
 * In a production environment, this MUST be set in environment variables.
 * We use a unique, stable string for consistent session verification across tabs.
 */
const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'fixam-ghana-v1-hardened-stable-secret-key-2024-unified';
const key = new TextEncoder().encode(SECRET_KEY);

export type AdminJWTPayload = {
  uid: string;
  email?: string;
  role: 'admin' | 'super_admin';
  portal: 'admin'; 
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

    const adminPayload = payload as unknown as AdminJWTPayload;
    
    // Strictly verify that the token belongs to the admin portal
    if (adminPayload.portal !== 'admin') {
        return null;
    }

    return adminPayload;
  } catch (error) {
    // If verification fails, it could be an expired token or a non-admin token
    return null;
  }
}
