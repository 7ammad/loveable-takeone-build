import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Update the casting call status to 'live'
    const updatedCall = await prisma.castingCall.update({
      where: { id: params.id },
      data: { status: 'live' },
    });

    // TODO: Trigger indexing in search system (Algolia)
    // This would be implemented when the search indexing system is ready
    console.log(`✅ Approved casting call: ${updatedCall.title} (ID: ${updatedCall.id})`);

    return NextResponse.json({
      success: true,
      call: updatedCall
    });
  } catch (error) {
    console.error('Failed to approve casting call:', error);
    return NextResponse.json(
      { error: 'Failed to approve casting call' },
      { status: 500 }
    );
  }
}
