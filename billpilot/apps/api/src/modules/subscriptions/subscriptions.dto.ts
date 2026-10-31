import { z } from 'zod';
import { createSubscriptionSchema, transitionSubscriptionSchema } from '@billpilot/shared';

export { createSubscriptionSchema, transitionSubscriptionSchema };
export type CreateSubscriptionDto = z.infer<typeof createSubscriptionSchema>;
export type TransitionSubscriptionDto = z.infer<typeof transitionSubscriptionSchema>;

