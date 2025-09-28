import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const calls = await prisma.castingCall.findMany({
      where: { status: 'pending_review' },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ calls });
  } catch (error) {
    console.error('Failed to fetch pending calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending calls' },
      { status: 500 }
    );
  }
}
