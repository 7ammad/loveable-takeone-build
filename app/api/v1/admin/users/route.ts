import { prisma } from '@packages/core-db';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';

export const GET = async (req: NextRequest) => {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(req, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      nafathVerified: true,
      createdAt: true,
      lastLoginAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(users);
};
