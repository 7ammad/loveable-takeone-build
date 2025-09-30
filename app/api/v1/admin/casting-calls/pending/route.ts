import { prisma } from '@packages/core-db';
import { handle } from '@/app/api/v1/helpers'; // Assuming helpers are restored/recreated

export const GET = handle(async () => {
  const pendingCastingCalls = await prisma.castingCall.findMany({
    where: {
      status: 'pending_review',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return new Response(JSON.stringify(pendingCastingCalls));
});
