import { z } from "zod";

// PHARMASOFT — Schémas Zod pour les retours / avoirs.

export const REFUND_REASONS = ["CLIENT_RETURN", "ERROR", "DEFECT", "EXPIRED", "OTHER"] as const;

export const refundLineSchema = z.object({
  saleLineId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
});

export const refundCreateSchema = z.object({
  reason: z.enum(REFUND_REASONS),
  restock: z.coerce.boolean().default(true),
  notes: z.string().max(500).optional().nullable(),
  lines: z.array(refundLineSchema).min(1, "Sélectionnez au moins un article à retourner"),
});

export type RefundCreateInput = z.infer<typeof refundCreateSchema>;
