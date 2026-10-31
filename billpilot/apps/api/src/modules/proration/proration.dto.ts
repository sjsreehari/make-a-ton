import { z } from 'zod';

export const prorationPreviewSchema = z.object({
  subscriptionId: z.string(),
  newPlanId: z.string(),
  effectiveDate: z.string().datetime().optional(),
});

export type ProrationPreviewDto = z.infer<typeof prorationPreviewSchema>;

