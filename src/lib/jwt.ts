import { SignJWT, jwtVerify } from 'jose';

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not defined");
}

export const key = new TextEncoder().encode(secret);

export type AdminJWTPayload = {
  uid: string;
  email?: string;
  role: 'admin' | 'super_admin';
  portal: 'admin' | 'provider'; 
  exp: number;
  iat: number;
};

/**
 * Signs a payload into a JWT.
 * Used for server-side session management.
 */
export async function signToken(payload: Omit<AdminJWTPayload, 'iat' | 'exp'>): Promise<string> {
  if (!payload || typeof payload !== 'object' || payload === null) {
    throw new Error('JWT Payload must be a valid non-null object');
  }

  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Increased session duration
    .sign(key);
}

/**
 * Verifies a JWT and returns its payload.
 * Returns null if verification fails.
 */
export async function verifyToken(token: string): Promise<AdminJWTPayload | null> {
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    return payload as unknown as AdminJWTPayload;
  } catch (error) {
    // Silently fail verification to allow middleware to handle redirects
    return null;
  }
}
