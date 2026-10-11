import { z } from "zod";

// PHARMASOFT — Schémas Zod pour les achats (bons de commande & réception).

export const purchaseOrderItemSchema = z.object({
  medicineId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(1_000_000),
  unitPrice: z.coerce.number().int().min(0).max(10_000_000), // prix d'achat unitaire
});

export const purchaseOrderCreateSchema = z.object({
  supplierId: z.string().min(1),
  expectedAt: z
    .union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()])
    .optional(),
  notes: z.string().max(1000).optional().nullable(),
  items: z.array(purchaseOrderItemSchema).min(1, "Ajoutez au moins une ligne"),
});

// Réception : pour chaque ligne reçue, on crée un lot daté.
export const receiveItemSchema = z.object({
  itemId: z.string().min(1),
  receivedQty: z.coerce.number().int().min(0).max(1_000_000),
  lotNumber: z.string().min(1).max(60),
  expiryDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const purchaseReceiveSchema = z.object({
  items: z.array(receiveItemSchema).min(1),
});

export type PurchaseOrderCreateInput = z.infer<typeof purchaseOrderCreateSchema>;
export type PurchaseReceiveInput = z.infer<typeof purchaseReceiveSchema>;
