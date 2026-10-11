import { z } from "zod";

// PHARMASOFT — Schémas Zod pour les médicaments.

export const MEDICINE_FORMS = [
  "COMPRIME",
  "COMPRIME_EFFERVESCENT",
  "GELULE",
  "SIROP",
  "SACHET",
  "AMPOULE",
  "AEROSOL",
  "POMMADE",
  "COLLYRE",
  "SUPPOSITOIRE",
  "INJECTABLE",
  "AUTRE",
] as const;

export const MEDICINE_CATEGORIES = [
  "ANTALGIQUE",
  "ANTIBIOTIQUE",
  "RESPIRATOIRE",
  "DIGESTIF",
  "CARDIO",
  "ANTI_INFLAMMATOIRE",
  "SOMNIFERE",
  "VITAMINES",
  "PEDIATRIE",
  "ANTIDIABETIQUE",
  "ANTISPASMODIQUE",
  "AUTRE",
] as const;

// Helper : "" → null (les chaînes vides des formulaires HTML deviennent null en BD)
const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

export const medicineCreateSchema = z.object({
  code: z.string().min(1).max(20),
  barcode: z.preprocess(emptyToNull, z.string().min(8).max(20).nullable().optional()),
  name: z.string().min(2).max(120),
  dci: z.string().min(2).max(120),
  form: z.enum(MEDICINE_FORMS),
  dosage: z.string().min(1).max(40),
  laboratory: z.string().min(1).max(80),
  category: z.enum(MEDICINE_CATEGORIES),
  sellPrice: z.coerce.number().int().min(0).max(10_000_000),
  purchasePrice: z.coerce.number().int().min(0).max(10_000_000).default(0),
  requiresPrescription: z.coerce.boolean().default(false),
  controlledSubstance: z.coerce.boolean().default(false),
  lowStockThreshold: z.coerce.number().int().min(0).default(20),
  description: z.preprocess(emptyToNull, z.string().max(1000).nullable().optional()),
});

export const medicineUpdateSchema = medicineCreateSchema.partial();

export const medicineListQuerySchema = z.object({
  q: z.string().optional(),
  category: z.enum(MEDICINE_CATEGORIES).optional(),
  status: z.enum(["all", "ok", "low", "out"]).optional().default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(200).default(50),
});

export type MedicineCreateInput = z.infer<typeof medicineCreateSchema>;
export type MedicineUpdateInput = z.infer<typeof medicineUpdateSchema>;
export type MedicineListQuery = z.infer<typeof medicineListQuerySchema>;
