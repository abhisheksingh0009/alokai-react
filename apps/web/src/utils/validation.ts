import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one symbol');

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .pipe(z.email('Enter a valid email address'));

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Password reset schema
export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Signup validation schema
export const signupSchema = z
  .object({
    title: z.string().min(1, 'Please select a title'),
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: emailSchema,
    countryCode: z.string().regex(/^\+\d{1,4}$/, 'Invalid country code'),
    phone: z
      .string()
      .optional()
      .refine((phone) => {
        if (!phone) return true;
        const digits = phone.replace(/[\s\-().]/g, '');
        return /^\d+$/.test(digits) && digits.length >= 7 && digits.length <= 15;
      }, 'Enter a valid phone number (7–15 digits)'),
    dateOfBirth: z
      .string()
      .optional()
      .refine((dob) => {
        if (!dob) return true;
        const birth = new Date(dob);
        if (Number.isNaN(birth.getTime())) return false;
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age >= 13;
      }, 'You must be at least 13 years old'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
