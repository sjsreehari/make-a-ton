import { z } from 'zod';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '@billpilot/shared';

export { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };
export type SignupDto = z.infer<typeof signupSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
