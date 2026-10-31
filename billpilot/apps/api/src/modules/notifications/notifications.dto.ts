import { z } from 'zod';
import { Channel } from '@billpilot/shared';

export const sendNotificationSchema = z.object({
  channel: z.nativeEnum(Channel),
  template: z.string().min(1),
  to: z.string().min(1),
  data: z.record(z.unknown()),
  dedupeKey: z.string().optional(),
  customerId: z.string().optional(),
});

export type SendNotificationDto = z.infer<typeof sendNotificationSchema>;
