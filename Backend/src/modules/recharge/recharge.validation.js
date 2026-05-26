import { z } from 'zod';

export const createRechargeSchema = z.object({
  operator: z.string().min(1, 'Operator is required'),
  number: z.string().length(10, 'Mobile number must be 10 digits').regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  amount: z.number().positive('Amount must be positive'),
  plan: z.string().min(1, 'Plan details are required'),
  planData: z.object({
    price: z.number(),
    data: z.string(),
    calls: z.string(),
    validity: z.string(),
    validityDays: z.number(),
    tag: z.string().optional()
  }).passthrough().optional().nullable(),
  payMethod: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  referralCode: z.string().optional().nullable(),
  useWallet: z.boolean().optional().nullable(),
  walletAmountUsed: z.number().optional().nullable(),
  paymentOrderId: z.string().optional().nullable(),
  planId: z.string().optional().nullable(),
  category: z.enum(['mobile', 'broadband', 'utility']).optional().nullable(),
  parentRechargeId: z.string().optional().nullable()
});
