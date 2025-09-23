import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CreatePaymentIntentSchema, CreatePaymentIntentResponseSchema } from '@/packages/core-contracts/src/schemas';
import { createPaymentIntent } from '@/packages/core-payments/src/moyasar-client';
import { withIdempotency } from '@/packages/core-security/src/idempotency';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreatePaymentIntentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.format() }, { status: 422 });
    }

    const result = await createPaymentIntent(parsed.data);
    const responseData = {
      ok: true,
      paymentId: result.id,
      status: result.status,
      clientSecret: result.client_secret,
    };
    const valid = CreatePaymentIntentResponseSchema.safeParse(responseData);
    if (!valid.success) {
      return NextResponse.json({ ok: false, error: valid.error.format() }, { status: 500 });
    }

    const response = NextResponse.json(responseData, { status: 201 });
    return withIdempotency(request, response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
