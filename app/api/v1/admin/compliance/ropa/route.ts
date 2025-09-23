import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentRopa } from '@/packages/core-compliance/src/ropa';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    // TODO: Add admin role check here

    const ropaData = await getCurrentRopa();

    return NextResponse.json({
      ok: true,
      data: ropaData,
    });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
