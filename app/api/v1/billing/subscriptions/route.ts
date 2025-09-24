import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import { z } from 'zod';
import { addToOutbox } from '@/packages/core-queue/src/outbox';

const createSubscriptionSchema = z.object({
  planId: z.string().cuid(),
  moyasarSubscriptionId: z.string().optional(),
});

// const updateSubscriptionSchema = z.object({
//   status: z.enum(['active', 'past_due', 'canceled']).optional(),
//   moyasarSubscriptionId: z.string().optional(),
// });

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    return NextResponse.json({ ok: true, subscription });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createSubscriptionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error.format() }, { status: 422 });
    }

    const { planId, moyasarSubscriptionId } = validation.data;

    // Check if plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json({ ok: false, error: 'Plan not found or inactive' }, { status: 404 });
    }

    // Create subscription
    const startDate = new Date();
    const endDate = new Date();
    if (plan.name.toLowerCase().includes('monthly')) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'active',
        startDate,
        endDate,
        moyasarSubscriptionId,
      },
      include: { plan: true },
    });

    // Add subscription event
    await prisma.subscriptionStatusEvent.create({
      data: {
        subscriptionId: subscription.id,
        toStatus: 'active',
      },
    });

    // Add to outbox for billing processing
    await addToOutbox('BillingEvent', {
      type: 'subscription_created',
      subscriptionId: subscription.id,
      userId,
      planId,
    });

    return NextResponse.json({ ok: true, subscription }, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
