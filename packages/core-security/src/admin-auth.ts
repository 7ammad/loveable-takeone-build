
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { prisma } from '@packages/core-db';
import { TokenPayload } from '@packages/core-auth/src/jwt';

type NextRouteHandler<T = any> = (
  req: NextRequest,
  context: { params: T },
  user: TokenPayload
) => Promise<NextResponse> | Promise<Response> | NextResponse | Response;

export function withAdminAuth<T = any>(handler: NextRouteHandler<T>) {
  return async (req: NextRequest, context: { params: T }) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyAccessToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    return handler(req, context, decoded);
  };
}
