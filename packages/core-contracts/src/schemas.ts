import { z } from 'zod';

// Schema for the standard error response
export const ErrorSchema = z.object({
  ok: z.boolean().default(false),
  error: z.string(),
});

// Schema for the successful health check response
export const HealthResponseSchema = z.object({
  ok: z.boolean(),
});

// Schema for the media upload request
export const RequestUploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/\w+\/[-+.\w]+/),
  size: z.number().positive(),
  userId: z.string(), // In a real app, this would be validated as a CUID
});

// Schema for the media upload response
export const RequestUploadResponseSchema = z.object({
  ok: z.boolean(),
  uploadUrl: z.string().url(),
  assetId: z.string(), // In a real app, this would be validated as a CUID
});

// Schema for the talent search response
export const TalentSearchResponseSchema = z.object({
  ok: z.boolean(),
  hits: z.array(z.any()), // In a real app, this would be a full TalentProfile schema
  page: z.number(),
  nbPages: z.number(),
  hitsPerPage: z.number(),
  nbHits: z.number(),
  query: z.string(),
});

// Schema for the user registration request
export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Schema for the user login request
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Schema for the authentication response (login and refresh)
export const AuthResponseSchema = z.object({
  ok: z.boolean(),
  accessToken: z.string(),
  refreshToken: z.string(),
});

// Schema for the token refresh request
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

// Schema for the logout request
export const LogoutRequestSchema = z.object({
  refreshToken: z.string(),
});

// Schema for a generic success response
export const SuccessResponseSchema = z.object({
  ok: z.boolean(),
});
