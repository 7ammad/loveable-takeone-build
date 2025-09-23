import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MoyasarWebhookSchema } from '@/packages/core-contracts/src/schemas';
import { prisma } from '@/packages/core-db/src/client';
import crypto from 'crypto';

function verifyHmac(requestBody: string, signature: string | null, secret: string | undefined): boolean {
  if (!signature || !secret) return false;
  const hmac = crypto.createHmac('sha256', secret).update(requestBody, 'utf8').digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text();
    const signature = request.headers.get('x-moyasar-signature');
    const secret = process.env.MOYASAR_WEBHOOK_SECRET;

    if (!verifyHmac(raw, signature, secret)) {
      return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(raw);
    const parsed = MoyasarWebhookSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.format() }, { status: 422 });
    }

    const data = parsed.data as {
      id: string;
      status: string;
      amount: number;
      currency: string;
      metadata?: { userId?: string; subscriptionId?: string };
    };
    const providerPaymentId = data.id;
    const status: string = data.status;
    const amount: number = data.amount;
    const currency: string = data.currency;
    const metadata = data.metadata ?? {};
    const userId = metadata.userId ?? '';
    const subscriptionId = metadata.subscriptionId ?? null;

    // Persist/update receipt idempotently by providerPaymentId
    await prisma.receipt.upsert({
      where: { providerPaymentId },
      create: {
        userId,
        subscriptionId,
        amount,
        currency,
        provider: 'moyasar',
        providerPaymentId,
        status,
        raw: data,
      },
      update: {
        status,
        raw: data,
      },
    });

    // Update subscription on success if provided
    if (subscriptionId && status.toLowerCase() === 'paid') {
      // Update subscription status and add event
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'active' },
      });
      await prisma.subscriptionStatusEvent.create({
        data: {
          subscriptionId,
          fromStatus: null,
          toStatus: 'active',
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
