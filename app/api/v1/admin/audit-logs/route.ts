import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/auth-helpers';
import { queryAuditLogs, getAuditStatistics } from '@/lib/enhanced-audit';

/**
 * GET /api/v1/admin/audit-logs
 * Query audit logs (admin only)
 */
export async function GET(request: NextRequest) {
  // Require admin role
  const userOrError = await requireRole(request, ['admin']);
  if (isErrorResponse(userOrError)) return userOrError;

  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      eventType: searchParams.get('eventType') || undefined,
      actorUserId: searchParams.get('actorUserId') || undefined,
      resourceType: searchParams.get('resourceType') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    };

    const result = await queryAuditLogs(filters);

    // Also get statistics if requested
    const includeStats = searchParams.get('includeStats') === 'true';
    const stats = includeStats ? await getAuditStatistics() : null;

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        statistics: stats,
      },
    });
  } catch (error) {
    console.error('[Audit Logs API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

