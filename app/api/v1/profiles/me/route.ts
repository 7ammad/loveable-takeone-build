import { NextRequest, NextResponse } from 'next/server';
import { getTalentProfileById } from '@packages/core-db/src/talent';
import { getCasterProfileById } from '@packages/core-db/src/caster';
import { requireTalent } from '@/lib/auth-helpers';
import { createErrorResponse } from '@/lib/error-handler';

/**
 * GET /api/v1/profiles/me
 * Fetch the current user's profile (Talent or Caster)
 */
export const GET = requireTalent()(async (_req: NextRequest, _context, user, dbUser) => {
  try {
    let profile: unknown = null;

    try {
      if (dbUser.role === 'talent') {
        profile = await getTalentProfileById(user.userId);
      } else if (dbUser.role === 'caster') {
        profile = await getCasterProfileById(user.userId);
      } else {
        return NextResponse.json(
          { success: false, error: `Invalid user role: ${dbUser.role}` },
          { status: 400 },
        );
      }
    } catch (dbError) {
      console.warn(
        '[Profile API] Database error (profile may not exist):',
        dbError instanceof Error ? dbError.message : dbError,
      );
      profile = null;
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return createErrorResponse(error, {
      functionName: '[Profile API] Error fetching user profile',
    });
  }
});
