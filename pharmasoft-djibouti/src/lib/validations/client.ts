import { z } from "zod";

// PHARMASOFT — Schémas Zod pour les clients.

export const CLIENT_TIERS = ["BRONZE", "ARGENT", "OR", "PLATINE"] as const;

const phoneRegex = /^\+?\d[\d\s\-]{6,20}$/;
const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

export const clientCreateSchema = z.object({
  code: z.string().max(20).optional(),
  name: z.string().min(2).max(120),
  phone: z.string().regex(phoneRegex, "Format de téléphone invalide"),
  email: z.preprocess(emptyToNull, z.string().email().nullable().optional()),
  dateOfBirth: z
    .union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()])
    .optional(),
  gender: z.enum(["M", "F"]).optional().nullable(),
  quarter: z.preprocess(emptyToNull, z.string().max(80).nullable().optional()),
  address: z.preprocess(emptyToNull, z.string().max(200).nullable().optional()),
  tier: z.enum(CLIENT_TIERS).optional().default("BRONZE"),
  allergies: z.array(z.string()).optional().default([]),
  conditions: z.array(z.string()).optional().default([]),
  notes: z.preprocess(emptyToNull, z.string().max(2000).nullable().optional()),
});

export const clientUpdateSchema = clientCreateSchema.partial();

export const clientListQuerySchema = z.object({
  q: z.string().optional(),
  tier: z.enum(CLIENT_TIERS).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(200).default(50),
});

export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
export type ClientListQuery = z.infer<typeof clientListQuerySchema>;
