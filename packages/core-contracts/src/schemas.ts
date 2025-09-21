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
