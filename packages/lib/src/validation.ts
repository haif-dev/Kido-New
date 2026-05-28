import { z } from 'zod';
import { WILAYAS } from './types';

/** Algerian phone: +213 followed by 9 digits, mobile starts with 5/6/7. */
export const algerianPhone = z
  .string()
  .regex(/^\+213[5-7]\d{8}$/, 'Numéro de téléphone algérien invalide');

export const email = z.string().email('Email invalide');

export const password = z
  .string()
  .min(8, 'Au moins 8 caractères')
  .regex(/[A-Z]/, 'Au moins une majuscule')
  .regex(/[0-9]/, 'Au moins un chiffre');

export const signUpSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis').max(50),
  lastName: z.string().min(1, 'Nom requis').max(50),
  email,
  password,
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions' }),
  }),
  marketingOptIn: z.boolean().optional(),
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Mot de passe requis'),
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(2000).optional(),
  phone: algerianPhone.optional(),
  city: z.string().max(100).optional(),
  wilaya: z.enum(WILAYAS).optional(),
  locale: z.enum(['fr', 'ar']).optional(),
});

export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  services: z.array(z.string()).optional(),
  ageGroups: z.array(z.string()).optional(),
  languages: z.array(z.enum(['fr', 'ar'])).optional(),
  minRate: z.number().int().nonnegative().optional(),
  maxRate: z.number().int().nonnegative().optional(),
  minExperience: z.number().int().nonnegative().optional(),
  verifiedOnly: z.boolean().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
