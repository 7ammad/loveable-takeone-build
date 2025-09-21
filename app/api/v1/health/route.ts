import { prisma } from '@/packages/core-db/src/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await prisma.$queryRaw`select 1`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
