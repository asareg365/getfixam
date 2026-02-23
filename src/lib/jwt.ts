import { SignJWT, jwtVerify } from 'jose';

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not defined");
}

const key = new TextEncoder().encode(secret);

export type AdminJWTPayload = {
  uid: string;
  email?: string;
  role: 'admin' | 'super_admin';
  portal: 'admin' | 'provider';
  exp: number;
  iat: number;
};

export async function signToken(
  payload: Omit<AdminJWTPayload, 'iat' | 'exp'>
): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function verifyToken(
  token: string
): Promise<AdminJWTPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    return payload as AdminJWTPayload;
  } catch {
    return null;
  }
}