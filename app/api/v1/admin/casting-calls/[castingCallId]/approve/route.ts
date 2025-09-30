import { prisma } from '@packages/core-db';
import { handle } from '@/app/api/v1/helpers';
import { indexerQueue } from '@packages/core-queue';

export const POST = handle(async (req, context) => {
  const params = await context.params;
  const castingCallId = Array.isArray(params.castingCallId) ? params.castingCallId[0] : params.castingCallId;

  if (!castingCallId) {
    return new Response(JSON.stringify({ message: 'Casting call ID is required' }), { status: 400 });
  }

  try {
    const updatedCastingCall = await prisma.castingCall.update({
      where: { id: castingCallId },
      data: { status: 'active' },
    });

    // Enqueue a job to index this casting call in Algolia
    await indexerQueue.add('index-casting-call', { castingCallId: updatedCastingCall.id });

    return new Response(JSON.stringify(updatedCastingCall));
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025') { // Prisma code for record not found
      return new Response(JSON.stringify({ message: 'Casting call not found' }), { status: 404 });
    }
    throw error;
  }
});
