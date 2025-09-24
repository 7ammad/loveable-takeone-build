import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import crypto from 'crypto';

export const runtime = 'nodejs';

const TRANSCODE_WEBHOOK_SECRET = process.env.TRANSCODE_WEBHOOK_SECRET;

async function verifyHmacSignature(request: NextRequest): Promise<{ isValid: boolean; body: any }> {
  const signature = request.headers.get('x-transcode-signature');
  const bodyBuffer = await request.text();

  if (!signature || !TRANSCODE_WEBHOOK_SECRET) {
    return { isValid: false, body: null };
  }

  const hmac = crypto.createHmac('sha256', TRANSCODE_WEBHOOK_SECRET);
  hmac.update(bodyBuffer);
  const digest = hmac.digest('hex');

  const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  
  return { isValid, body: JSON.parse(bodyBuffer) };
}

export async function POST(request: NextRequest) {
  if (!TRANSCODE_WEBHOOK_SECRET) {
    console.error('[Transcode Callback] Missing TRANSCODE_WEBHOOK_SECRET');
    return NextResponse.json({ ok: false, error: 'Webhook secret not configured' }, { status: 500 });
  }

  const { isValid, body } = await verifyHmacSignature(request);

  if (!isValid) {
    return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const { assetId, status, outputs } = body;

    if (!assetId || !status) {
      return NextResponse.json({ ok: false, error: 'Missing assetId or status' }, { status: 400 });
    }

    const mediaAsset = await prisma.mediaAsset.findUnique({ where: { id: assetId } });
    if (!mediaAsset) {
      return NextResponse.json({ ok: false, error: 'Asset not found' }, { status: 404 });
    }
    
    // Example: update asset with transcoded output details
    await prisma.mediaAsset.update({
      where: { id: assetId },
      data: {
        status: status === 'completed' ? 'ready' : 'error',
        transcodeData: outputs, // Assuming 'outputs' contains URLs, formats, etc.
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[Transcode Callback] Error processing callback:', error);
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}

