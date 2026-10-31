import { z } from 'zod';

export const createTaxRuleSchema = z.object({
  name: z.string().min(2).max(100),
  ratePercent: z.string().regex(/^\d+(\.\d{1,2})?$/),
  region: z.string().optional(),
  isInclusive: z.boolean().default(false),
});

export type CreateTaxRuleDto = z.infer<typeof createTaxRuleSchema>;

