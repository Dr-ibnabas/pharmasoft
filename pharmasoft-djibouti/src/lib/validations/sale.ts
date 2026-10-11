import { z } from "zod";

// PHARMASOFT — Schémas Zod pour les ventes (POS).

export const PAYMENT_METHODS = ["CASH", "CARD", "DMONEY", "WAAFI", "INSURANCE", "CREDIT"] as const;

export const saleLineSchema = z.object({
  medicineId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(10_000),
  prescriptionId: z.string().optional().nullable(),
});

// Un paiement = un moyen + un montant. Plusieurs paiements = paiement mixte.
export const paymentSchema = z.object({
  method: z.enum(PAYMENT_METHODS),
  amount: z.coerce.number().int().min(1),
  reference: z.string().max(60).optional().nullable(),
});

export const saleCreateSchema = z.object({
  lines: z.array(saleLineSchema).min(1, "Le panier ne peut pas être vide"),
  clientId: z.string().optional().nullable(),
  // Liste des paiements (au moins un). La somme doit couvrir le reste à charge client.
  payments: z.array(paymentSchema).min(1, "Au moins un paiement"),
  // Active le tiers-payant : l'assurance du client prend en charge sa part.
  useInsurance: z.coerce.boolean().default(false),
  discountPercent: z.coerce.number().min(0).max(50).default(0),
  // Points de fidélité à utiliser (1 point = 1 Fdj de réduction, cf. D-131).
  pointsToRedeem: z.coerce.number().int().min(0).default(0),
  // PIN Titulaire si la vente contient un médicament Rx et que le vendeur n'est pas Titulaire.
  validationPin: z.string().regex(/^\d{4}$/).optional().nullable(),
});

export type SaleLineInput = z.infer<typeof saleLineSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type SaleCreateInput = z.infer<typeof saleCreateSchema>;
