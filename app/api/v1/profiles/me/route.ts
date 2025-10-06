import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { getTalentProfileById } from '@packages/core-db/src/talent';
import { getCasterProfileById } from '@packages/core-db/src/caster';
import { prisma } from '@packages/core-db/src/client';

/**
 * GET /api/v1/profiles/me
 * Fetch the current user's profile (Talent or Caster)
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 2. Fetch profile based on user role
    let profile = null;
    let userRole = payload.role;

    // If role is undefined in token, fetch it from database
    if (!userRole) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { role: true }
        });
        userRole = user?.role;
        console.log('[Profile API] Fetched role from database:', userRole);
      } catch (dbError) {
        console.error('[Profile API] Failed to fetch user role:', dbError);
        return NextResponse.json(
          { success: false, error: 'Unable to determine user role' },
          { status: 400 }
        );
      }
    }

    try {
      if (userRole === 'talent') {
        profile = await getTalentProfileById(payload.userId);
      } else if (userRole === 'caster') {
        profile = await getCasterProfileById(payload.userId);
      } else {
        console.error('[Profile API] Invalid role:', userRole);
        return NextResponse.json(
          { success: false, error: `Invalid user role: ${userRole}` },
          { status: 400 }
        );
      }
    } catch (dbError: any) {
      // Handle case where profile functions or tables don't exist
      console.warn('[Profile API] Database error (profile may not exist):', dbError.message);
      profile = null;
    }

    // 3. Return profile (or null if not yet created)
    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('[Profile API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

