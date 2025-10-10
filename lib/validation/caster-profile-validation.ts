/**
 * Caster Profile Validation
 * Type-specific field validation and business rules
 */

import { getCasterTypeInfo, getCategoryForType } from '@/lib/constants/caster-taxonomy';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate Commercial Registration (Saudi CR format)
 */
export function validateCommercialRegistration(cr: string): ValidationResult {
  const errors: string[] = [];
  
  // Saudi CR is 10 digits
  if (!/^\d{10}$/.test(cr)) {
    errors.push('Commercial Registration must be exactly 10 digits');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate license number format based on authority
 */
export function validateLicenseNumber(
  licenseNumber: string,
  authority: 'GCAM' | 'GEA' | 'MOC'
): ValidationResult {
  const errors: string[] = [];
  
  // Basic validation - at least 5 characters
  if (licenseNumber.length < 5) {
    errors.push(`${authority} license number must be at least 5 characters`);
  }
  
  // Authority-specific validation could be added here
  // For now, we'll just check basic format
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate phone number (Saudi format preferred)
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  const errors: string[] = [];
  
  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Check for Saudi format (+966 or 05)
  const saudiPattern = /^(\+966|05)\d{8}$/;
  const internationalPattern = /^\+\d{10,15}$/;
  
  if (!saudiPattern.test(cleanPhone) && !internationalPattern.test(cleanPhone)) {
    errors.push('Phone number must be in valid format (e.g., +966501234567 or 0501234567)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(email)) {
    errors.push('Invalid email address format');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate website URL
 */
export function validateWebsite(url: string): ValidationResult {
  const errors: string[] = [];
  
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      errors.push('Website URL must use HTTP or HTTPS protocol');
    }
  } catch {
    errors.push('Invalid website URL format');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate established year
 */
export function validateEstablishedYear(year: number): ValidationResult {
  const errors: string[] = [];
  const currentYear = new Date().getFullYear();
  
  if (year < 1900 || year > currentYear) {
    errors.push(`Established year must be between 1900 and ${currentYear}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate type-specific fields based on caster type
 */
export function validateTypeSpecificFields(
  companyType: string,
  typeSpecificFields: any
): ValidationResult {
  const errors: string[] = [];
  
  const typeInfo = getCasterTypeInfo(companyType);
  if (!typeInfo) {
    errors.push('Invalid company type');
    return { valid: false, errors };
  }
  
  const category = getCategoryForType(companyType);
  
  // Category-specific validation rules
  switch (category) {
    case 'production_companies':
      // Production companies should have production scale info
      if (typeSpecificFields?.productionScale) {
        const validScales = ['independent', 'small', 'medium', 'large'];
        if (!validScales.includes(typeSpecificFields.productionScale)) {
          errors.push('Invalid production scale');
        }
      }
      break;
      
    case 'broadcasting_media':
      // Broadcasting entities should have audience reach info
      if (typeSpecificFields?.audienceReach && typeof typeSpecificFields.audienceReach !== 'number') {
        errors.push('Audience reach must be a number');
      }
      break;
      
    case 'advertising_marketing':
      // Marketing agencies should have client portfolio size
      if (typeSpecificFields?.clientPortfolioSize && typeof typeSpecificFields.clientPortfolioSize !== 'number') {
        errors.push('Client portfolio size must be a number');
      }
      break;
      
    case 'events_entertainment':
      // Event companies should have annual events count
      if (typeSpecificFields?.annualEventsCount && typeof typeSpecificFields.annualEventsCount !== 'number') {
        errors.push('Annual events count must be a number');
      }
      break;
      
    case 'government_institutions':
      // Government entities should have ministry/authority name
      if (!typeSpecificFields?.authorityName) {
        errors.push('Authority name is required for government institutions');
      }
      break;
      
    case 'talent_services':
      // Talent agencies should have talent roster size
      if (typeSpecificFields?.talentRosterSize && typeof typeSpecificFields.talentRosterSize !== 'number') {
        errors.push('Talent roster size must be a number');
      }
      break;
      
    case 'corporate':
      // Corporate brands should have parent company info
      if (companyType === 'corporate_brand' && !typeSpecificFields?.parentCompany) {
        errors.push('Parent company name is required for corporate brands');
      }
      break;
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate complete caster profile
 */
export function validateCasterProfile(profileData: any): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  const requiredFields = ['companyNameEn', 'companyType', 'companyCategory', 'businessPhone', 'businessEmail', 'city'];
  for (const field of requiredFields) {
    if (!profileData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate phone number
  if (profileData.businessPhone) {
    const phoneValidation = validatePhoneNumber(profileData.businessPhone);
    errors.push(...phoneValidation.errors);
  }
  
  // Validate email
  if (profileData.businessEmail) {
    const emailValidation = validateEmail(profileData.businessEmail);
    errors.push(...emailValidation.errors);
  }
  
  // Validate website if provided
  if (profileData.website) {
    const websiteValidation = validateWebsite(profileData.website);
    errors.push(...websiteValidation.errors);
  }
  
  // Validate commercial registration if provided
  if (profileData.commercialRegistration) {
    const crValidation = validateCommercialRegistration(profileData.commercialRegistration);
    errors.push(...crValidation.errors);
  }
  
  // Validate established year if provided
  if (profileData.establishedYear) {
    const yearValidation = validateEstablishedYear(profileData.establishedYear);
    errors.push(...yearValidation.errors);
  }
  
  // Validate type-specific fields
  if (profileData.companyType && profileData.typeSpecificFields) {
    const typeValidation = validateTypeSpecificFields(profileData.companyType, profileData.typeSpecificFields);
    errors.push(...typeValidation.errors);
  }
  
  // Validate team size
  if (profileData.teamSize !== undefined && profileData.teamSize < 0) {
    errors.push('Team size cannot be negative');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate project data
 */
export function validateProject(projectData: any): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  if (!projectData.projectName) errors.push('Project name is required');
  if (!projectData.projectType) errors.push('Project type is required');
  if (!projectData.projectYear) errors.push('Project year is required');
  
  // Validate project year
  if (projectData.projectYear) {
    const currentYear = new Date().getFullYear();
    const year = parseInt(projectData.projectYear);
    if (year < 1950 || year > currentYear + 5) {
      errors.push(`Project year must be between 1950 and ${currentYear + 5}`);
    }
  }
  
  // Validate project URL if provided
  if (projectData.projectUrl) {
    const urlValidation = validateWebsite(projectData.projectUrl);
    errors.push(...urlValidation.errors);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate team member data
 */
export function validateTeamMember(memberData: any): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  if (!memberData.name) errors.push('Team member name is required');
  if (!memberData.role) errors.push('Team member role is required');
  
  // Validate email if provided
  if (memberData.email) {
    const emailValidation = validateEmail(memberData.email);
    errors.push(...emailValidation.errors);
  }
  
  // Validate permissions
  const validPermissions = ['view_applications', 'edit_jobs', 'manage_team', 'post_jobs', 'manage_bookings', 'view_analytics'];
  if (memberData.permissions && Array.isArray(memberData.permissions)) {
    for (const perm of memberData.permissions) {
      if (!validPermissions.includes(perm)) {
        errors.push(`Invalid permission: ${perm}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

