import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDpiaReviewSchedule, requiresDpiaAssessment } from '@/packages/core-compliance/src/dpia';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    // TODO: Add admin role check here

    const reviewSchedule = getDpiaReviewSchedule();

    // Check which activities require DPIA
    const activitiesRequiringDpia = [
      'Talent Profile Management',
      'Payment Processing',
      'Guardian Consent Management',
      'User Registration and Authentication',
      'Application Processing',
    ];

    const dpiaStatus = await Promise.all(
      activitiesRequiringDpia.map(async (activity) => ({
        activity,
        requiresDpia: await requiresDpiaAssessment(activity),
        nextReview: reviewSchedule.find(r => r.activity === activity)?.nextReview,
      }))
    );

    return NextResponse.json({
      ok: true,
      data: {
        reviewSchedule,
        dpiaStatus,
      },
    });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
