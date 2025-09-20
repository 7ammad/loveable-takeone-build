import { prisma } from '../../../../../../packages/core-db/src/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await prisma.$queryRaw`select 1`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
