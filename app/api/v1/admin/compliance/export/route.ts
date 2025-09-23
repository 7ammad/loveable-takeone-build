import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { exportComplianceData } from '@/packages/core-compliance/src/export';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    // TODO: Add admin role check here
    // For now, assume authenticated users can access

    const body = await request.json();
    const { includeMinors = false, dateRange, purpose } = body;

    const exportData = await exportComplianceData({
      includeMinors,
      dateRange: dateRange ? {
        from: new Date(dateRange.from),
        to: new Date(dateRange.to),
      } : undefined,
      purpose,
    });

    return NextResponse.json({
      ok: true,
      data: exportData,
    });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
