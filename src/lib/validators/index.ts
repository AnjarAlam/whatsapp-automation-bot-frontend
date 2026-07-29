import { z } from 'zod';

export const loginSchema = z.object({
  emailOrMobile: z.string().min(1, 'Email or Mobile number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full Name is required'),
    businessName: z.string().min(2, 'Business Name is required'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().min(7, 'Mobile number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid registered email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const customerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  mobile: z.string().min(7, 'Valid mobile number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  tags: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export const campaignSchema = z.object({
  name: z.string().min(2, 'Campaign name is required'),
  type: z.enum(['Offer', 'Festival', 'Announcement', 'Reminder']),
  message: z.string().min(2, 'Campaign message content is required'),
  scheduledAt: z.string().optional(),
});

export type CampaignInput = z.infer<typeof campaignSchema>;

export const flowSchema = z.object({
  title: z.string().min(2, 'Flow title is required'),
  triggerKeyword: z.string().min(1, 'Trigger keyword is required (e.g. hi, menu)'),
  welcomeMessage: z.string().min(2, 'Welcome message is required'),
  options: z
    .array(
      z.object({
        key: z.string().min(1, 'Key required'),
        label: z.string().min(1, 'Label required'),
        responseMessage: z.string().min(1, 'Response message required'),
      }),
    )
    .min(1, 'At least one menu option is required'),
});

export type FlowInput = z.infer<typeof flowSchema>;
