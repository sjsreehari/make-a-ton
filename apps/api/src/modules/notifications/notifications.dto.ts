import { z } from 'zod';
import { sendNotificationSchema } from '@billpilot/shared';

export { sendNotificationSchema };
export type SendNotificationDto = z.infer<typeof sendNotificationSchema> & {
  entity?: string;
  entityId?: string;
};

export const queryLogsSchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  channel: z.enum(['WHATSAPP', 'EMAIL']).optional(),
  status: z.enum(['QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'SKIPPED']).optional(),
  customerId: z.string().optional(),
});
export type QueryLogsDto = z.infer<typeof queryLogsSchema>;

export const templateSchema = z.object({
  key: z.string().min(1),
  channel: z.enum(['WHATSAPP', 'EMAIL']),
  subject: z.string().optional(),
  body: z.string().min(1),
  isActive: z.boolean().optional().default(true),
});
export type TemplateDto = z.infer<typeof templateSchema>;

export { templateSchema as createTemplateSchema };
export type CreateTemplateDto = TemplateDto;
