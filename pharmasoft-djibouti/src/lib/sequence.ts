import type { Prisma } from "@prisma/client";

// PHARMASOFT — Génération de numéros séquentiels atomiques et inviolables.
// Utilisé pour les factures, bons de commande, avoirs, registre stupéfiants.
//
// Le compteur vit dans la table Sequence (clé = `${prefix}-${year}`). L'incrément
// se fait dans une transaction Prisma via upsert, ce qui garantit l'unicité même
// en cas d'accès concurrents (la contrainte de clé primaire sérialise les écritures).

/**
 * Incrémente et retourne la prochaine valeur d'un compteur.
 * À appeler DANS une transaction (`tx`) pour garantir l'atomicité avec le reste.
 */
export async function nextSequenceValue(
  tx: Prisma.TransactionClient,
  key: string,
): Promise<number> {
  const seq = await tx.sequence.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  });
  return seq.value;
}

/** Formate un numéro de document : PREFIX-ANNEE-NNNNN. */
export function formatDocNumber(prefix: string, year: number, value: number, width = 5): string {
  return `${prefix}-${year}-${String(value).padStart(width, "0")}`;
}

/**
 * Génère un numéro de document complet (préfixe + année + séquence) en une étape.
 * Ex: nextDocNumber(tx, "FAC") => "FAC-2026-00001"
 */
export async function nextDocNumber(
  tx: Prisma.TransactionClient,
  prefix: string,
  year = new Date().getFullYear(),
  width = 5,
): Promise<{ number: string; value: number }> {
  const key = `${prefix}-${year}`;
  const value = await nextSequenceValue(tx, key);
  return { number: formatDocNumber(prefix, year, value, width), value };
}
