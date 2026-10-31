import { z } from 'zod';

export const createDiscountSchema = z.object({
  code: z.string().min(2).max(50).toUpperCase(),
  name: z.string().min(2).max(100),
  type: z.enum(['FIXED', 'PERCENTAGE']),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/),
  scope: z.enum(['PRODUCT', 'SUBSCRIPTION']),
  productIds: z.array(z.string()).default([]),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  usageLimit: z.number().int().positive().optional(),
});

export type CreateDiscountDto = z.infer<typeof createDiscountSchema>;

