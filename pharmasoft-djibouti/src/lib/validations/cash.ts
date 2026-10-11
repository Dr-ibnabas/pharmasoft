import { z } from "zod";

export const cashOpenSchema = z.object({
  openingFloat: z.coerce.number().int().min(0).max(10_000_000),
  notes: z.string().max(500).optional().nullable(),
});

export const cashCloseSchema = z.object({
  countedAmount: z.coerce.number().int().min(0).max(100_000_000),
  notes: z.string().max(500).optional().nullable(),
});

export type CashOpenInput = z.infer<typeof cashOpenSchema>;
export type CashCloseInput = z.infer<typeof cashCloseSchema>;
