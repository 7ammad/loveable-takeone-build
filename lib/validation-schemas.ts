/**
 * Centralized Validation Schemas
 * Using Zod for type-safe input validation
 */

import { z } from 'zod';
import { stripHtml } from '@/lib/sanitizer';

/**
 * A Zod transform to automatically sanitize string inputs.
 * This should be applied to any string schema that accepts user-provided free text.
 * It strips all HTML to prevent XSS.
 */
export const sanitizeText = z.string().transform(val => stripHtml(val));

// ===================================
// Common Reusable Schemas
// ===================================

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)')
  .optional()
  .nullable();

export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .max(2048, 'URL must not exceed 2048 characters')
  .optional()
  .nullable();

export const cuidSchema = z
  .string()
  .regex(/^c[a-z0-9]{24}$/, 'Invalid ID format');

export const uuidSchema = z
  .string()
  .uuid('Invalid UUID format');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// ===================================
// Auth Schemas
// ===================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').trim(),
  role: z.enum(['talent', 'caster'], {
    errorMap: () => ({ message: 'Role must be either "talent" or "caster"' }),
  }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

// ===================================
// Profile Schemas
// ===================================

export const talentProfileSchema = z.object({
  stageName: z.string().min(1, 'Stage name is required').max(255).trim(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Gender must be male, female, or other' }),
  }),
  city: z.string().min(1, 'City is required').max(255).trim(),
  height: z.number().int().min(50).max(300).optional().nullable(),
  weight: z.number().int().min(20).max(500).optional().nullable(),
  eyeColor: z.string().max(50).optional().nullable(),
  hairColor: z.string().max(50).optional().nullable(),
  experience: z.number().int().min(0).max(100).optional().nullable(),
  willingToTravel: z.boolean().default(false),
  skills: z.array(z.string().max(100)).max(50).default([]),
  languages: z.array(z.string().max(50)).max(20).default([]),
  portfolioUrl: urlSchema,
  demoReelUrl: urlSchema,
  instagramUrl: urlSchema,
});

export const casterProfileSchema = z.object({
  companyNameEn: z.string().min(1, 'Company name (English) is required').max(255).trim(),
  companyNameAr: z.string().max(255).optional().nullable(),
  companyType: z.string().max(100).optional().nullable(),
  commercialRegistration: z.string().max(100).optional().nullable(),
  businessPhone: phoneSchema,
  businessEmail: emailSchema.optional().nullable(),
  website: urlSchema,
  city: z.string().max(255).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  teamSize: z.number().int().min(1).max(10000).optional().nullable(),
  establishedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
  specializations: z.array(z.string().max(100)).max(20).default([]),
  companyDescription: z.string().max(2000).optional().nullable(),
  logoUrl: urlSchema,
  bannerUrl: urlSchema,
  showreelUrl: urlSchema,
  facebookUrl: urlSchema,
  instagramUrl: urlSchema,
  twitterUrl: urlSchema,
  linkedinUrl: urlSchema,
});

// ===================================
// Casting Call Schemas
// ===================================

export const castingCallCreateSchema = z.object({
  title: sanitizeText.pipe(z.string().min(3, 'Title must be at least 3 characters').max(255)),
  description: sanitizeText.pipe(z.string().min(10, 'Description must be at least 10 characters').max(5000)).optional().nullable(),
  projectType: z.string().max(100).optional().nullable(),
  company: sanitizeText.pipe(z.string().max(255)).optional().nullable(),
  location: sanitizeText.pipe(z.string().max(255)).optional().nullable(),
  compensation: sanitizeText.pipe(z.string().max(500)).optional().nullable(),
  compensationType: z.enum(['paid', 'unpaid', 'negotiable']).optional().nullable(),
  requirements: sanitizeText.pipe(z.string().max(5000)).optional().nullable(),
  deadline: z.coerce.date().optional().nullable(),
  status: z.enum(['draft', 'pending_review', 'published', 'cancelled', 'expired']).default('draft'),
  rolesNeeded: z.number().int().min(1).max(1000).default(1),
  ageRangeMin: z.number().int().min(0).max(120).optional().nullable(),
  ageRangeMax: z.number().int().min(0).max(120).optional().nullable(),
  genderPreference: z.enum(['male', 'female', 'other', 'any']).optional().nullable(),
  skills: z.array(z.string().max(100)).max(50).default([]),
  languages: z.array(z.string().max(50)).max(20).default([]),
});

export const castingCallUpdateSchema = castingCallCreateSchema.partial();

export const castingCallSearchSchema = z.object({
  q: z.string().max(500).optional(),
  projectType: z.string().max(100).optional(),
  location: z.string().max(255).optional(),
  compensationType: z.enum(['paid', 'unpaid', 'negotiable']).optional(),
  status: z.enum(['draft', 'pending_review', 'published', 'cancelled', 'expired']).optional(),
  ...paginationSchema.shape,
});

// ===================================
// Application Schemas
// ===================================

export const applicationCreateSchema = z.object({
  castingCallId: cuidSchema,
  coverLetter: z.string().max(2000).optional().nullable(),
  portfolioUrl: urlSchema,
  availableFrom: z.coerce.date().optional().nullable(),
  availableTo: z.coerce.date().optional().nullable(),
});

export const applicationUpdateSchema = z.object({
  status: z.enum(['pending', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn']),
  notes: z.string().max(2000).optional().nullable(),
});

// ===================================
// Media Upload Schemas
// ===================================

export const mediaUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimetype: z.string().regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i, 'Invalid MIME type'),
  size: z.number().int().min(1).max(100 * 1024 * 1024), // Max 100MB
  visibility: z.enum(['public', 'private', 'unlisted']).default('private'),
});

// ===================================
// Message Schemas
// ===================================

export const messageCreateSchema = z.object({
  receiverId: cuidSchema,
  content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long').trim(),
});

export const conversationCreateSchema = z.object({
  participantId: cuidSchema,
});

// ===================================
// Search Schemas
// ===================================

export const savedSearchCreateSchema = z.object({
  name: z.string().min(1, 'Search name is required').max(255).trim(),
  description: z.string().max(500).optional().nullable(),
  searchTerm: z.string().max(500).default(''),
  filters: z.record(z.unknown()).default({}),
  sortBy: z.string().max(50).default('relevance'),
});

// ===================================
// Booking Schemas
// ===================================

export const bookingCreateSchema = z.object({
  applicationId: cuidSchema,
  castingCallId: cuidSchema,
  talentUserId: cuidSchema,
  scheduledDate: z.coerce.date(),
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format'),
  duration: z.number().int().min(15).max(480), // 15 min to 8 hours
  location: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const bookingUpdateSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show']),
  actualStartTime: z.coerce.date().optional().nullable(),
  actualEndTime: z.coerce.date().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

// ===================================
// Notification Schemas
// ===================================

export const notificationCreateSchema = z.object({
  userId: cuidSchema,
  type: z.string().max(100),
  title: z.string().min(1).max(255).trim(),
  message: z.string().min(1).max(1000).trim(),
  actionUrl: urlSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ===================================
// Admin Schemas
// ===================================

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: emailSchema.optional(),
  role: z.enum(['talent', 'caster', 'admin']).optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
});

export const auditLogQuerySchema = z.object({
  eventType: z.string().max(100).optional(),
  actorUserId: cuidSchema.optional(),
  resourceType: z.string().max(100).optional(),
  resourceId: cuidSchema.optional(),
  ...dateRangeSchema.shape,
  ...paginationSchema.shape,
});

// ===================================
// Helper Functions
// ===================================

/**
 * Validate request body against a schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Validate query params against a schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Format Zod errors for API response
 */
export function formatValidationErrors(error: z.ZodError): {
  message: string;
  errors: Record<string, string[]>;
} {
  const errors: Record<string, string[]> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }
  
  return {
    message: 'Validation failed',
    errors,
  };
}


