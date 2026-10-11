import { z } from "zod";

export const ROLES = ["SUPER_ADMIN", "TITULAIRE", "VENDEUR", "CAISSIER"] as const;

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export const userCreateSchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().min(2).max(120),
  password: z
    .string()
    .regex(passwordRegex, "8+ caractères dont 1 majuscule et 1 chiffre"),
  role: z.enum(ROLES),
  locale: z.enum(["FR", "AR", "EN"]).default("FR"),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  role: z.enum(ROLES).optional(),
  isActive: z.boolean().optional(),
  locale: z.enum(["FR", "AR", "EN"]).optional(),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
});

export const pinChangeSchema = z.object({
  currentPin: z.string().regex(/^\d{4}$/).optional().nullable(),
  newPin: z.string().regex(/^\d{4}$/, "Le PIN doit comporter 4 chiffres"),
  confirmPin: z.string().regex(/^\d{4}$/),
}).refine((d) => d.newPin === d.confirmPin, {
  message: "Les deux PIN ne correspondent pas",
  path: ["confirmPin"],
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type PinChangeInput = z.infer<typeof pinChangeSchema>;
