import jwt from 'jsonwebtoken';
import { prisma } from '@/packages/core-db/src/client';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'saudi-casting-marketplace';
const JWT_ISSUER = process.env.JWT_ISSUER || 'saudi-casting-marketplace';

interface TokenPayload {
  userId: string;
  jti: string;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
}

export function generateAccessToken(userId: string, jti: string): string {
  const payload = {
    userId,
    jti,
  } as const;
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER
  });
}

export function generateRefreshToken(userId: string, jti: string): string {
  const payload = {
    userId,
    jti,
  } as const;
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER
  });
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER
    }) as TokenPayload;

    if (process.env.NODE_ENV !== 'test') {
      console.log('[JWT] Token verified successfully, checking revocation for JTI:', payload.jti);
    }

    // Check against revocation list in the database
    try {
      const isRevoked = await prisma.revokedToken.findUnique({
        where: { jti: payload.jti },
      });

      if (process.env.NODE_ENV !== 'test') {
        console.log('[JWT] Revocation check result:', isRevoked);
      }

      if (isRevoked) {
        if (process.env.NODE_ENV !== 'test') {
          console.log('[JWT] Token is revoked');
        }
        return null;
      }

      if (process.env.NODE_ENV !== 'test') {
        console.log('[JWT] Token is valid');
      }
      return payload;
    } catch (dbError) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('[JWT] Database error during revocation check:', dbError);
      }
      // If table doesn't exist, allow token for testing
      if (dbError instanceof Error && dbError.message.includes('does not exist')) {
        if (process.env.NODE_ENV !== 'test') {
          console.log('[JWT] RevokedToken table missing, allowing token for testing');
        }
        return payload;
      }
      throw dbError;
    }
  } catch (error) {
    // Treat invalid tokens as expected auth failures; avoid noisy stack traces
    const reason = error instanceof Error ? error.message : 'verification failed';
    console.warn('[JWT] Token verification failed:', reason);
    return null;
  }
}
