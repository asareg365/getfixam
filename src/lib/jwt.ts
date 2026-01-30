'use server';

import jwt from 'jsonwebtoken';

// It's crucial to use a strong, secret key stored in an environment variable.
const SECRET = process.env.ADMIN_JWT_SECRET || 'this-is-a-super-secret-key-that-should-be-in-an-env-file';

if (process.env.NODE_ENV === 'production' && SECRET === 'this-is-a-super-secret-key-that-should-be-in-an-env-file') {
    console.warn('WARNING: ADMIN_JWT_SECRET is not set for production. Using a default, insecure secret.');
}

/**
 * Signs a payload to create a JWT.
 * @param payload The data to include in the token.
 * @param expiresIn How long the token should be valid (e.g., '2h', '7d').
 * @returns The signed JWT string.
 */
export function signToken(payload: object, expiresIn = '2h'): string {
  return jwt.sign(payload, SECRET, { expiresIn });
}

/**
 * Verifies a JWT. Throws an error if the token is invalid or expired.
 * @param token The JWT string to verify.
 * @returns The decoded payload of the token.
 */
export function verifyToken(token: string): string | jwt.JwtPayload {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    console.error("JWT Verification Error:", error);
    // Don't expose internal error details to the client
    throw new Error("Invalid or expired session token.");
  }
}
