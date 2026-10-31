import { z } from 'zod';

export const createPaylinkSchema = z.object({
  invoiceId: z.string().min(1),
});

export type CreatePaylinkDto = z.infer<typeof createPaylinkSchema>;
