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
  contentType: z.string().regex(/\w+\/[\-+.\w]+/),
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

// Billing schemas
export const CreatePaymentIntentSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().min(1),
  description: z.string().min(1),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreatePaymentIntentResponseSchema = z.object({
  ok: z.boolean(),
  paymentId: z.string(),
  status: z.string(),
  clientSecret: z.string().optional(),
});

export const MoyasarWebhookSchema = z.object({
  id: z.string(),
  status: z.string(),
  amount: z.number().int(),
  currency: z.string(),
  created_at: z.number().optional(),
  source: z.any().optional(),
});

export const ReceiptSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subscriptionId: z.string().nullable(),
  amount: z.number().int(),
  currency: z.string(),
  provider: z.string(),
  providerPaymentId: z.string(),
  status: z.string(),
  createdAt: z.string(),
});
