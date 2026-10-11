import { z } from "zod";

// PHARMASOFT — Schémas Zod pour les lots & ajustements de stock.

export const lotCreateSchema = z.object({
  medicineId: z.string().min(1),
  lotNumber: z.string().min(1).max(60),
  quantity: z.coerce.number().int().min(0),
  expiryDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  supplierId: z.string().optional().nullable(),
  purchasePrice: z.coerce.number().int().min(0).default(0),
});

export const stockAdjustSchema = z.object({
  lotId: z.string().min(1),
  delta: z.coerce.number().int(),                     // peut être négatif
  reason: z.string().min(2).max(200),
  type: z.enum(["ADJUST_PLUS", "ADJUST_MINUS", "OUT_LOSS", "OUT_EXPIRY", "RETURN_SUPPLIER"]),
});

export type LotCreateInput = z.infer<typeof lotCreateSchema>;
export type StockAdjustInput = z.infer<typeof stockAdjustSchema>;
