import { z } from 'zod'

// Mirrors the rules in backend/src/controllers/auth.controller.js, so mistakes
// are caught before a request is sent. The server checks them again.
export const loginFormSchema = z.object({
  identifier: z.string({ error: 'Enter your username or email' }).trim().min(1, 'Enter your username or email'),
  password: z.string({ error: 'Enter your password' }).min(1, 'Enter your password'),
})
export type LoginFormValues = z.infer<typeof loginFormSchema>

export const registerFormSchema = z
  .object({
    username: z
      .string({ error: 'Username is required' })
      .trim()
      .regex(/^[a-zA-Z0-9_.]{3,30}$/, 'Use 3 to 30 letters, numbers, dots or underscores'),
    email: z.string({ error: 'Email is required' }).trim().pipe(z.email('Enter a valid email address')),
    password: z
      .string({ error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
    confirmPassword: z.string({ error: 'Confirm your password' }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
export type RegisterFormValues = z.infer<typeof registerFormSchema>

export const forgotPasswordFormSchema = z.object({
  email: z.string({ error: 'Email is required' }).trim().pipe(z.email('Enter a valid email address')),
})
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>

// Mirrors backend/src/controllers/auth.controller.js's resetPasswordSchema.
export const resetPasswordFormSchema = z
  .object({
    password: z
      .string({ error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
    confirmPassword: z.string({ error: 'Confirm your password' }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>
