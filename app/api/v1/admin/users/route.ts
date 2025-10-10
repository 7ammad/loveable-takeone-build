import { prisma } from '@packages/core-db';
import { createAdminHandler } from '../../helpers';

export const GET = createAdminHandler(async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      nafathVerified: true,
    },
  });

  return new Response(JSON.stringify(users));
});
