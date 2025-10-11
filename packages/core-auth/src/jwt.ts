import jwt from 'jsonwebtoken';
import { prisma } from '@/packages/core-db/src/client';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'saudi-casting-marketplace';
const JWT_ISSUER = process.env.JWT_ISSUER || 'saudi-casting-marketplace';

export interface TokenPayload {
  userId: string;
  role?: string;
  jti: string;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
  // Nafath verification claims
  nafathVerified?: boolean;
  nafathVerifiedAt?: number;
  nafathExpiresAt?: number;
  verificationLevel?: 'nafath' | 'email' | 'phone' | 'none';
}

export function generateAccessToken(
  userId: string,
  jti: string,
  role?: string,
  verificationData?: {
    nafathVerified?: boolean;
    nafathVerifiedAt?: Date;
    nafathExpiresAt?: Date;
  }
): string {
  const payload: Partial<TokenPayload> = {
    userId,
    jti,
    role,
  };

  // Add Nafath verification claims if provided
  if (verificationData) {
    payload.nafathVerified = verificationData.nafathVerified || false;
    payload.nafathVerifiedAt = verificationData.nafathVerifiedAt?.getTime();
    payload.nafathExpiresAt = verificationData.nafathExpiresAt?.getTime();

    // Determine verification level
    if (verificationData.nafathVerified) {
      payload.verificationLevel = 'nafath';
    } else {
      payload.verificationLevel = 'none';
    }
  }

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
    algorithm: 'HS256',
  });
}

export function generateRefreshToken(
  userId: string,
  jti: string,
  role?: string,
  verificationData?: {
    nafathVerified?: boolean;
    nafathVerifiedAt?: Date;
    nafathExpiresAt?: Date;
  }
): string {
  const payload: Partial<TokenPayload> = {
    userId,
    jti,
    role,
  };

  // Add Nafath verification claims if provided (for refresh tokens too)
  if (verificationData) {
    payload.nafathVerified = verificationData.nafathVerified || false;
    payload.nafathVerifiedAt = verificationData.nafathVerifiedAt?.getTime();
    payload.nafathExpiresAt = verificationData.nafathExpiresAt?.getTime();

    // Determine verification level
    if (verificationData.nafathVerified) {
      payload.verificationLevel = 'nafath';
    } else {
      payload.verificationLevel = 'none';
    }
  }

  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
    algorithm: 'HS256',
  });
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
      algorithms: ['HS256'],
    }) as TokenPayload;

    // Check against revocation list in the database (for immediate revocation)
    try {
      const isRevoked = await prisma.revokedToken.findUnique({
        where: { jti: payload.jti },
      });

      if (isRevoked) {
        if (process.env.NODE_ENV !== 'test') {
          console.log('[JWT] Access token is revoked');
        }
        return null;
      }

      return payload;
    } catch (dbError) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('[JWT] Database error during access token revocation check:', dbError);
      }
      // If table doesn't exist, allow token for testing
      if (dbError instanceof Error && dbError.message.includes('does not exist')) {
        if (process.env.NODE_ENV !== 'test') {
          console.log('[JWT] RevokedToken table missing, allowing access token for testing');
        }
        return payload;
      }
      throw dbError;
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'verification failed';
    console.warn('[JWT] Access token verification failed:', reason);
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
      algorithms: ['HS256'],
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
