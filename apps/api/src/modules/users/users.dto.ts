import { z } from 'zod';
import { passwordSchema } from '@billpilot/shared';

export const createStaffSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase().trim(),
  password: passwordSchema,
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'STAFF']),
});

export type CreateStaffDto = z.infer<typeof createStaffSchema>;

