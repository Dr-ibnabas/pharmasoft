import type { Role } from "@prisma/client";

// PHARMASOFT — Matrice de permissions par rôle.
// Source de vérité unique pour : filtrage du menu sidebar, middleware,
// vérifications API. Voir DECISIONS.md D-010 à D-014.

export type AppResource =
  | "dashboard"
  | "pos"
  | "caisse"
  | "medicines"
  | "stock"
  | "inventory"
  | "clients"
  | "prescriptions"
  | "suppliers"
  | "purchases"
  | "reports"
  | "insurance"
  | "invoices"
  | "controlled-register"
  | "notifications"
  | "users"
  | "settings"
  | "audit-log";

/**
 * Périmètre exact de chaque rôle. Toute ressource non listée est interdite.
 * - SUPER_ADMIN : technique uniquement (D-012)
 * - TITULAIRE  : tout sauf rien (gestion complète)
 * - VENDEUR    : ventes libres + consult catalogue + clients (D-013, prix d'achat masqué)
 * - CAISSIER   : POS + caisse uniquement (D-014, validation PIN pour Rx)
 */
export const PERMISSIONS: Record<Role, ReadonlyArray<AppResource>> = {
  // Le dashboard est ouvert aux 4 rôles mais avec des variantes très différentes
  // (cf. composants dashboard/<role>-dashboard.tsx). Pour le reste, la matrice
  // reste strictement scopée selon DECISIONS.md D-012/D-013/D-014.
  SUPER_ADMIN: ["dashboard", "users", "settings", "notifications", "audit-log"],
  TITULAIRE: [
    "dashboard",
    "pos",
    "caisse",
    "medicines",
    "stock",
    "inventory",
    "clients",
    "prescriptions",
    "suppliers",
    "purchases",
    "reports",
    "insurance",
    "invoices",
    "controlled-register",
    "notifications",
    "users",       // Le titulaire peut gérer son équipe (vendeurs/caissiers)
    "settings",
    "audit-log",
  ],
  // Le vendeur peut consulter le stock et faire un inventaire, mais pas les achats/finances.
  VENDEUR: ["dashboard", "pos", "medicines", "stock", "inventory", "clients", "notifications"],
  CAISSIER: ["dashboard", "pos", "caisse", "notifications"],
};

/** Écran d'accueil par défaut selon le rôle.
 * Avec la matrice mise à jour, les 4 rôles ont accès au dashboard (avec contenu adapté),
 * c'est donc la home par défaut. Chaque rôle accède ensuite à son workflow principal.
 */
export const DEFAULT_HOME_BY_ROLE: Record<Role, AppResource> = {
  SUPER_ADMIN: "dashboard",
  TITULAIRE: "dashboard",
  VENDEUR: "dashboard",
  CAISSIER: "dashboard",
};

/** Le rôle a-t-il accès à cette ressource ? */
export function canAccess(role: Role | null | undefined, resource: AppResource): boolean {
  if (!role) return false;
  return PERMISSIONS[role].includes(resource);
}

/**
 * Le rôle peut-il voir les prix d'achat / marge / coût ?
 * Spécifié dans D-013 : VENDEUR doit être aveugle aux prix d'achat.
 * SUPER_ADMIN n'a pas accès aux médicaments tout court.
 */
export function canSeePurchasePrice(role: Role | null | undefined): boolean {
  return role === "TITULAIRE";
}

/**
 * Une vente d'un médicament `requiresPrescription=true` initiée par ce rôle
 * doit-elle déclencher le modal de validation pharmacien (PIN Titulaire) ?
 * Spécifié dans D-014.
 */
export function requiresPharmacistValidation(role: Role | null | undefined): boolean {
  return role === "CAISSIER" || role === "VENDEUR";
}

/** Le rôle peut-il consulter les rapports financiers (CA, marges, etc.) ? */
export function canViewFinancials(role: Role | null | undefined): boolean {
  return role === "TITULAIRE";
}

/** Lance une erreur si la session courante n'a pas accès à la ressource. */
export function assertRole(role: Role | null | undefined, resource: AppResource): void {
  if (!canAccess(role, resource)) {
    const err = new Error(`Accès refusé à la ressource "${resource}" pour le rôle ${role ?? "<inconnu>"}.`);
    (err as { status?: number }).status = 403;
    throw err;
  }
}

/**
 * Mappe une URL de l'App Router vers une ressource métier.
 * Retourne null si la route n'est pas protégée (login, public, ...).
 */
export function resourceFromPath(pathname: string): AppResource | null {
  // On supprime le préfixe de locale ([/fr|/ar|/en])
  const stripped = pathname.replace(/^\/(fr|ar|en)(?=\/|$)/, "") || "/";

  if (stripped.startsWith("/dashboard")) return "dashboard";
  if (stripped.startsWith("/pos")) return "pos";
  if (stripped.startsWith("/ventes")) return "pos";
  if (stripped.startsWith("/caisse")) return "caisse";
  if (stripped.startsWith("/medicaments")) return "medicines";
  if (stripped.startsWith("/inventaire")) return "inventory";
  if (stripped.startsWith("/stock")) return "stock";
  if (stripped.startsWith("/clients")) return "clients";
  if (stripped.startsWith("/ordonnances")) return "prescriptions";
  if (stripped.startsWith("/achats")) return "purchases";
  if (stripped.startsWith("/fournisseurs")) return "suppliers";
  if (stripped.startsWith("/rapports")) return "reports";
  if (stripped.startsWith("/assurances")) return "insurance";
  if (stripped.startsWith("/factures")) return "invoices";
  if (stripped.startsWith("/stupefiants")) return "controlled-register";
  if (stripped.startsWith("/notifications")) return "notifications";
  if (stripped.startsWith("/utilisateurs")) return "users";
  if (stripped.startsWith("/parametres")) return "settings";
  if (stripped.startsWith("/audit")) return "audit-log";
  return null;
}

/**
 * Couleur de marque + libellé pour chaque rôle.
 * Référence : DECISIONS.md D-010, D-011.
 */
export const ROLE_THEME: Record<Role, { color: string; label: string; short: string; icon: string }> = {
  SUPER_ADMIN: { color: "#8B5CF6", label: "Super Admin", short: "Admin", icon: "shield-check" },
  TITULAIRE: { color: "#1E40AF", label: "Pharmacien titulaire", short: "Titulaire", icon: "stethoscope" },
  VENDEUR: { color: "#10B981", label: "Vendeur", short: "Vendeur", icon: "shopping-bag" },
  CAISSIER: { color: "#F59E0B", label: "Caissier", short: "Caisse", icon: "banknote" },
};
