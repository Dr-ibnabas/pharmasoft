import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusion de classes Tailwind avec dédupli + arbitrage variantes (shadcn). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formate un montant en Franc Djiboutien.
 * Convention : séparateur espace pour les milliers, pas de décimale.
 * Ex.: 152400 -> "152 400 Fdj"
 */
export function fmtMoney(amount: number, withCurrency = true): string {
  const rounded = Math.round(amount);
  const withSpaces = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return withCurrency ? `${withSpaces} Fdj` : withSpaces;
}

/** Formate une date ISO en chaîne lisible courte (ex. "27 mai 2026"). */
export function fmtDate(input: string | Date, locale = "fr-FR"): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Formate une date+heure complète (ex. "27 mai 2026 à 14:32"). */
export function fmtDateTime(input: string | Date, locale = "fr-FR"): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Initiales d'un nom (max 2 caractères, majuscules). */
export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * Couleur stable dérivée d'une chaîne (hash → index de palette).
 * Utilisé pour les avatars et vignettes de médicaments.
 */
export function colorFromString(input: string): string {
  const palette = [
    "#0EA5E9",
    "#10B981",
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#06B6D4",
    "#EF4444",
    "#22C55E",
  ];
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length] ?? "#0EA5E9";
}

/**
 * Calcule un total de panier avec TVA et remise.
 * `discountPercent` est exprimé en pourcentage (0..100).
 */
export function computeCartTotals(params: {
  lines: { price: number; qty: number }[];
  discountPercent?: number;
  tvaRate?: number;
}): {
  subtotal: number;
  discountAmount: number;
  taxableBase: number;
  tax: number;
  total: number;
} {
  const subtotal = params.lines.reduce((s, l) => s + l.price * l.qty, 0);
  const discountAmount = subtotal * ((params.discountPercent ?? 0) / 100);
  const taxableBase = subtotal - discountAmount;
  const tax = taxableBase * (params.tvaRate ?? 0.1);
  const total = taxableBase + tax;
  return { subtotal, discountAmount, taxableBase, tax, total };
}

/** Normalise un numéro djiboutien au format "+253 XX XX XX XX". */
export function fmtPhoneDJ(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Enlève l'indicatif s'il est déjà collé
  const local = digits.startsWith("253") ? digits.slice(3) : digits;
  const pairs = local.match(/.{1,2}/g) ?? [];
  return `+253 ${pairs.join(" ")}`.trim();
}

/** Pause utilitaire (utilisable côté serveur pour simuler de la latence en dev). */
export function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
