/**
 * Profile utility functions
 */

export interface CasterProfile {
  id: string;
  companyNameEn?: string;
  companyType?: string;
  companyCategory?: string;
  businessPhone?: string;
  businessEmail?: string;
  city?: string;
}

/**
 * Check if a caster profile is complete enough to use the platform
 */
export function isCasterProfileComplete(profile: CasterProfile | null): boolean {
  if (!profile) return false;
  
  // Required fields for basic functionality
  const requiredFields = [
    profile.companyNameEn,
    profile.companyType,
    profile.companyCategory,
    profile.businessPhone,
    profile.businessEmail,
    profile.city,
  ];
  
  return requiredFields.every(field => field && field.trim().length > 0);
}

/**
 * Calculate profile completion percentage
 */
export function calculateCasterProfileCompletion(profile: CasterProfile | null): number {
  if (!profile) return 0;
  
  const fields = [
    profile.companyNameEn,
    profile.companyType,
    profile.companyCategory,
    profile.businessPhone,
    profile.businessEmail,
    profile.city,
  ];
  
  const filledFields = fields.filter(field => field && field.trim().length > 0).length;
  return Math.round((filledFields / fields.length) * 100);
}

