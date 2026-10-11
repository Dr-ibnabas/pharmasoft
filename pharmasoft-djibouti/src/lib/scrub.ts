import type { Role } from "@prisma/client";
import { canSeePurchasePrice } from "@/lib/permissions";

// PHARMASOFT — Filtrage des données sensibles selon le rôle.
// Source de vérité : D-013 (le VENDEUR ne doit jamais voir prix d'achat).

/**
 * Retire les champs financiers sensibles d'un médicament pour les rôles non habilités.
 * Utilisé côté API ET côté server-component avant de transmettre vers le client.
 */
export function scrubMedicineForRole<T extends { purchasePrice?: number | null }>(
  medicine: T,
  role: Role,
): T {
  if (canSeePurchasePrice(role)) return medicine;
  // On retourne un nouveau objet sans purchasePrice (et autres marges futures).
  const { purchasePrice: _drop, ...rest } = medicine;
  return rest as T;
}

/** Variante batch. */
export function scrubMedicinesForRole<T extends { purchasePrice?: number | null }>(
  medicines: T[],
  role: Role,
): T[] {
  if (canSeePurchasePrice(role)) return medicines;
  return medicines.map((m) => scrubMedicineForRole(m, role));
}

/** Idem pour les lots (purchasePrice du lot lui-même). */
export function scrubLotForRole<T extends { purchasePrice?: number | null }>(
  lot: T,
  role: Role,
): T {
  if (canSeePurchasePrice(role)) return lot;
  const { purchasePrice: _drop, ...rest } = lot;
  return rest as T;
}
