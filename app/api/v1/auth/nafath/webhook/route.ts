import { NextRequest, NextResponse } from 'next/server';
import { processNafathWebhook } from '@/packages/core-security/src/nafath-gate';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const webhookData = JSON.parse(rawBody);

    console.log('Received Nafath webhook:', {
      transaction_id: webhookData.transaction_id,
      status: webhookData.status,
      user_id: webhookData.user_id,
      timestamp: new Date().toISOString()
    });

    // Process the webhook
    const result = await processNafathWebhook(webhookData);

    if (result.success) {
      console.log('Nafath webhook processed successfully:', result.message);
      return NextResponse.json({
        success: true,
        message: result.message
      });
    } else {
      console.error('Nafath webhook processing failed:', result.message);
      return NextResponse.json(
        {
          success: false,
          error: result.message
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Nafath webhook processing error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Webhook processing failed',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
