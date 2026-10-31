import { z } from 'zod';

export const auditFilterSchema = z.object({
  entity: z.string().optional(),
  entityId: z.string().optional(),
  actorId: z.string().optional(),
  action: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type AuditFilterDto = z.infer<typeof auditFilterSchema>;
