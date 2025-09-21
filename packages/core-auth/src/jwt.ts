import jwt from 'jsonwebtoken';
import { prisma } from '@/packages/core-db/src/client';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;

interface TokenPayload {
  userId: string;
  jti: string;
}

export function generateAccessToken(userId: string, jti: string): string {
  const payload: TokenPayload = { userId, jti };
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string, jti: string): string {
  const payload: TokenPayload = { userId, jti };
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
    
    // Check against revocation list in the database
    const isRevoked = await prisma.revokedToken.findUnique({
      where: { jti: payload.jti },
    });

    if (isRevoked) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
