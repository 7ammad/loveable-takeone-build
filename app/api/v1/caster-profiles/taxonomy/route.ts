/**
 * Caster Taxonomy API
 * GET /api/v1/caster-profiles/taxonomy - Get complete taxonomy structure
 */

import { NextResponse } from 'next/server';
import { 
  CASTER_TAXONOMY, 
  getAllCasterTypes, 
  getAllCategories,
  COMPANY_SIZE_OPTIONS,
  LICENSE_AUTHORITIES,
  COMPLIANCE_STATUS,
  TEAM_PERMISSIONS
} from '@/lib/constants/caster-taxonomy';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        taxonomy: CASTER_TAXONOMY,
        meta: {
          categories: getAllCategories(),
          types: getAllCasterTypes(),
          companySizeOptions: COMPANY_SIZE_OPTIONS,
          licenseAuthorities: LICENSE_AUTHORITIES,
          complianceStatus: COMPLIANCE_STATUS,
          teamPermissions: TEAM_PERMISSIONS
        }
      }
    });
  } catch (error) {
    console.error('[API] Error fetching taxonomy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch taxonomy' },
      { status: 500 }
    );
  }
}

