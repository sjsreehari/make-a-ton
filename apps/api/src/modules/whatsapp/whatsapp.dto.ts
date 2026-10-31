import { z } from 'zod';

export const whatsappWebhookSchema = z.object({
  From: z.string().optional(),
  Body: z.string().optional(),
  ProfileName: z.string().optional(),
});

export type WhatsappWebhookDto = z.infer<typeof whatsappWebhookSchema>;
