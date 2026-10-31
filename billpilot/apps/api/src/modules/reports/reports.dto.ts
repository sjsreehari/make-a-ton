import { z } from 'zod';

export const reportFilterSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  planId: z.string().optional(),
  customerId: z.string().optional(),
  status: z.string().optional(),
});

export type ReportFilterDto = z.infer<typeof reportFilterSchema>;

