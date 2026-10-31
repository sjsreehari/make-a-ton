import { z } from 'zod';

export const sendNotificationSchema = z.object({
  channel: z.enum(['WHATSAPP', 'EMAIL']),
  template: z.string().min(1),
  to: z.string().min(1),
  data: z.record(z.unknown()),
  dedupeKey: z.string().optional(),
  customerId: z.string().optional(),
});
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;

