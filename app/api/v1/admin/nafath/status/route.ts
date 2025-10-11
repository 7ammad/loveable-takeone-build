import { NextRequest, NextResponse } from 'next/server';
import { checkExpiringVerifications } from '@/packages/core-security/src/nafath-gate';
import { requireRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(request, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

  try {
    const { searchParams } = new URL(request.url);
    const daysAhead = parseInt(searchParams.get('daysAhead') || '30');

    // Get users with expiring verifications
    const expiringUsers = await checkExpiringVerifications(daysAhead);

    // TODO: Get comprehensive verification statistics from database
    // For now, providing placeholder statistics
    const stats = {
      totalVerifiedUsers: 0, // TODO: Implement database query
      expiringWithin30Days: expiringUsers.length,
      expiredVerifications: 0, // TODO: Implement database query
      recentVerifications: 0, // TODO: Implement database query
      expiringUsers: expiringUsers.slice(0, 50), // Limit for performance
    };

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Admin Nafath status error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch verification status',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
