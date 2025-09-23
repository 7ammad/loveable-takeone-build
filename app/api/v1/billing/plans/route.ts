import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import { z } from 'zod';

const createPlanSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().positive(),
  currency: z.string().default('SAR'),
  features: z.array(z.string()),
  moyasarPlanId: z.string().optional(),
});

const updatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().int().positive().optional(),
  currency: z.string().optional(),
  features: z.array(z.string()).optional(),
  moyasarPlanId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    return NextResponse.json({ ok: true, plans });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createPlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error.format() }, { status: 422 });
    }

    const plan = await prisma.plan.create({
      data: validation.data,
    });

    return NextResponse.json({ ok: true, plan }, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
