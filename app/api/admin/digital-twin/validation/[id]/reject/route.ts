import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Update the casting call status to 'rejected'
    const updatedCall = await prisma.castingCall.update({
      where: { id: params.id },
      data: { status: 'rejected' },
    });

    console.log(`❌ Rejected casting call: ${updatedCall.title} (ID: ${updatedCall.id})`);

    return NextResponse.json({
      success: true,
      call: updatedCall
    });
  } catch (error) {
    console.error('Failed to reject casting call:', error);
    return NextResponse.json(
      { error: 'Failed to reject casting call' },
      { status: 500 }
    );
  }
}
