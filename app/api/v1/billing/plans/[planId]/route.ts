import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ planId: string }>;
}

const updatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().int().positive().optional(),
  currency: z.string().optional(),
  features: z.array(z.string()).optional(),
  moyasarPlanId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { planId } = await context.params;

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ ok: false, error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, plan });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { planId } = await context.params;
    const body = await request.json();
    const validation = updatePlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error.format() }, { status: 422 });
    }

    const plan = await prisma.plan.update({
      where: { id: planId },
      data: validation.data,
    });

    return NextResponse.json({ ok: true, plan });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { planId } = await context.params;

    // Soft delete by setting isActive to false
    await prisma.plan.update({
      where: { id: planId },
      data: { isActive: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
