'use server';

import { SignJWT, jwtVerify } from 'jose';

// Use a stable secret for the JWT handshake. 
const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'fixam-ghana-secure-stable-key-2024-v1-persistent';
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
 * Signs a payload to create a secure JWT.
 */
export async function signToken(payload: Omit<AdminJWTPayload, 'iat' | 'exp'>): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(key);
}

/**
 * Verifies a JWT and returns the typed payload or null.
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
    return null;
  }
}
