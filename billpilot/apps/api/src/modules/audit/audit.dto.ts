import { z } from 'zod';

export const auditFilterSchema = z.object({
  entity: z.string().optional(),
  entityId: z.string().optional(),
  actorId: z.string().optional(),
});

export type AuditFilterDto = z.infer<typeof auditFilterSchema>;

