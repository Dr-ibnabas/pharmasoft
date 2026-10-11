import { z } from "zod";

export const settingsUpdateSchema = z.object({
  pharmacyName: z.string().min(2).max(120).optional(),
  address: z.string().min(2).max(200).optional(),
  city: z.string().min(2).max(80).optional(),
  phone: z.string().min(5).max(40).optional(),
  email: z.string().email().nullable().optional(),
  nif: z.string().min(2).max(40).optional(),
  tvaRate: z.coerce.number().min(0).max(1).optional(),
  lowStockDefault: z.coerce.number().int().min(0).max(10_000).optional(),
  expiryWarnDays: z.coerce.number().int().min(0).max(365).optional(),
  expiryAlertDays: z.coerce.number().int().min(0).max(365).optional(),
  defaultLocale: z.enum(["FR", "AR", "EN"]).optional(),
});

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
