'use server';

import jwt from 'jsonwebtoken';

const SECRET = process.env.ADMIN_JWT_SECRET || 'a-very-super-secret-key-that-is-at-least-32-chars-long';

if (process.env.NODE_ENV === 'production' && SECRET === 'a-very-super-secret-key-that-is-at-least-32-chars-long') {
  console.warn('WARNING: ADMIN_JWT_SECRET is not set in a production environment. Using a default, insecure secret.');
}

export function signToken(payload: object, expiresIn = '2h'): string {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyToken<T extends object = { uid: string, email: string }>(token: string): T {
  return jwt.verify(token, SECRET) as T;
}
