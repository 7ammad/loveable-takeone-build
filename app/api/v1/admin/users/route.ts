import { prisma } from '@packages/core-db';
import { handle } from '../../helpers';

export const GET = handle(async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      nafathVerified: true,
    },
  });

  return new Response(JSON.stringify(users));
});
