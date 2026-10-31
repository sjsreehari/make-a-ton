import { z } from 'zod';

export const resolveFindingSchema = z.object({
  findingId: z.string().min(1),
  resolution: z.string().optional(),
});

export type ResolveFindingDto = z.infer<typeof resolveFindingSchema>;
