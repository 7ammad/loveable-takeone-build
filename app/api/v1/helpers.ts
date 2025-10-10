import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { verifyAccessToken } from '@packages/core-auth';
import { prisma } from '@packages/core-db';

type RouteContext = {
  params: Promise<Record<string, string | string[] | undefined>>;
};

type RouteHandler = (req: NextRequest, context: RouteContext) => Promise<Response>;

export function createAdminHandler(handler: RouteHandler): RouteHandler {
  return handle(async (req, context) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized: No token provided' }), {
        status: 401,
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyAccessToken(token);

    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
      });
    }

    return handler(req, context);
  });
}

export function handle(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context: RouteContext) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            message: 'Validation failed',
            errors: error.flatten().fieldErrors,
          }),
          { status: 400 }
        );
      }

      if (error instanceof Error) {
        console.error(error);
        return new Response(
          JSON.stringify({ message: 'An unexpected error occurred', error: error.message }),
          { status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ message: 'An unknown error occurred' }),
        { status: 500 }
      );
    }
  };
}
