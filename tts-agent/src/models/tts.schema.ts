import { z } from 'zod';

export const generateTTSRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  voice: z.string().optional().default('en-US-AriaNeural'),
  speed: z.number().min(-100).max(200).optional().default(1.0),
  pitch: z.number().min(-100).max(100).optional().default(0),
  volume: z.number().min(0).max(100).optional().default(100),
});

export type GenerateTTSRequest = z.infer<typeof generateTTSRequestSchema>;

export const batchTTSRequestSchema = z.array(z.string().min(1).max(5000)).min(1).max(50);
