import { prisma } from '@/packages/core-db/src/client';

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  if (!userId) return false;
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });
  if (!sub) return false;
  if (sub.status !== 'active') return false;
  if (sub.endDate && sub.endDate < new Date()) return false;
  return true;
}
