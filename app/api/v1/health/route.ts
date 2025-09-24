import { prisma } from '@/packages/core-db/src/client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check for error simulation (used in tests)
    const simulateError = request.headers.get('x-simulate-error');

    if (simulateError === 'true') {
      return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
    }

    await prisma.$queryRaw`select 1`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
