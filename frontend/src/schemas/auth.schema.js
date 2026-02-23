import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, { error: 'Username is required' }),
  password: z.string().min(1, { error: 'Password is required' }),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, { error: 'First name is required' }),
  lastName: z.string().min(1, { error: 'Last name is required' }),
  username: z.string().min(3, { error: 'Username must be at least 3 characters' }).max(50),
  password: z.string()
    .min(8, { error: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  error: 'Passwords do not match',
  path: ['confirmPassword'],
});
