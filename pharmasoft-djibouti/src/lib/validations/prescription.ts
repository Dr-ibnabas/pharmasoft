import { z } from "zod";

// PHARMASOFT — Schémas Zod pour les ordonnances.

export const PRESCRIPTION_STATUSES = ["PENDING", "PARTIAL", "FULFILLED", "EXPIRED", "CANCELLED"] as const;

export const prescriptionItemSchema = z.object({
  medicineId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(10_000),
  posology: z.string().max(200).optional().nullable(),
  duration: z.string().max(80).optional().nullable(),
});

export const prescriptionCreateSchema = z.object({
  clientId: z.string().min(1),
  doctorName: z.string().min(2).max(120),
  doctorContact: z.string().max(40).optional().nullable(),
  issuedDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  expiresAt: z.union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()]).optional(),
  notes: z.string().max(2000).optional().nullable(),
  items: z.array(prescriptionItemSchema).min(1, "Au moins un médicament"),
});

export const prescriptionUpdateSchema = z.object({
  status: z.enum(PRESCRIPTION_STATUSES).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export const prescriptionValidateSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, "Le PIN doit comporter 4 chiffres"),
});

export const prescriptionListQuerySchema = z.object({
  q: z.string().optional(),
  status: z.enum(PRESCRIPTION_STATUSES).optional(),
  clientId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(200).default(50),
});

export type PrescriptionCreateInput = z.infer<typeof prescriptionCreateSchema>;
export type PrescriptionUpdateInput = z.infer<typeof prescriptionUpdateSchema>;
export type PrescriptionValidateInput = z.infer<typeof prescriptionValidateSchema>;
export type PrescriptionListQuery = z.infer<typeof prescriptionListQuerySchema>;
