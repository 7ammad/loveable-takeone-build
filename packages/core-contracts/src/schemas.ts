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
