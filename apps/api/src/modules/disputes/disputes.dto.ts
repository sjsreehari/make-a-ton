import { z } from 'zod';

export const createDisputeSchema = z.object({
  invoiceId: z.string().min(1),
  reason: z.string().min(5),
});

export type CreateDisputeDto = z.infer<typeof createDisputeSchema>;
