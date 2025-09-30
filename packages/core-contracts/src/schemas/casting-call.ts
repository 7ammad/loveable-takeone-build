import { z } from 'zod';

export const CastingCallSchema = z.object({
  id: z.string().optional(),
  title: z.string().nonempty({ message: "Title is required." }),
  description: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  compensation: z.string().optional(),
  requirements: z.string().optional(),
  deadline: z.string().datetime().optional().nullable(),
  contactInfo: z.string().optional(),
  sourceUrl: z.string().optional(),
  sourceName: z.string().optional(),
  status: z.string().optional(),
  contentHash: z.string().optional(),
});

export type CastingCall = z.infer<typeof CastingCallSchema>;
