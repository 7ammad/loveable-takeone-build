import { prisma } from '@packages/core-db';
import { handle } from '@/app/api/v1/helpers';
import { CastingCallSchema } from '@packages/core-contracts';

// We only allow a subset of fields to be edited by an admin.
const EditSchema = CastingCallSchema.partial();

export const PATCH = handle(async (req, context) => {
  const params = await context.params;
  const castingCallId = Array.isArray(params.castingCallId) ? params.castingCallId[0] : params.castingCallId;

  if (!castingCallId) {
    return new Response(JSON.stringify({ message: 'Casting call ID is required' }), { status: 400 });
  }

  const json = await req.json();
  const castingCallData = EditSchema.parse(json);

  try {
    const updatedCastingCall = await prisma.castingCall.update({
      where: { id: castingCallId },
      data: castingCallData,
    });

    return new Response(JSON.stringify(updatedCastingCall));
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025') {
      return new Response(JSON.stringify({ message: 'Casting call not found' }), { status: 404 });
    }
    throw error;
  }
});
