import { z } from 'zod';

export const registerSchema = z.object({
  mobile: z.string().length(10, 'Mobile number must be exactly 10 digits').regex(/^[6-9]\d{9}$/, 'Invalid mobile number format'),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  referralCode: z.string().optional().nullable()
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Mobile is required'),
  password: z.string().min(1, 'Password is required')
});
