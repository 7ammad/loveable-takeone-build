import { NextRequest } from 'next/server';
import { ZodError } from 'zod';

type RouteContext = {
  params: Promise<Record<string, string | string[] | undefined>>;
};

type RouteHandler = (req: NextRequest, context: RouteContext) => Promise<Response>;

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
