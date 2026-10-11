import type { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  Package,
  ClipboardCheck,
  Users,
  FileText,
  Truck,
  ShoppingBag,
  BarChart3,
  Shield,
  FileSpreadsheet,
  Pin,
  Bell,
  Settings as SettingsIcon,
  User as UserIcon,
  Banknote,
  Receipt,
  ScrollText,
} from "lucide-react";

// PHARMASOFT — Source unique des éléments de navigation.
// Le filtrage par rôle est appliqué via `roles[]`. Le path est sans préfixe locale.

export type NavGroup = "general" | "clients_sales" | "admin" | "modules";

export interface NavItem {
  /** Clé d'i18n (référence à `nav.<key>` dans messages/*.json). */
  key: string;
  /** Slug d'URL après /{locale}/. */
  path: string;
  icon: LucideIcon;
  group: NavGroup;
  roles: ReadonlyArray<Role>;
  badgeKey?: "notifications" | "prescriptions";
}

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  // ─── Général ────────────────────────────────────────────────
  { key: "dashboard", path: "dashboard", icon: LayoutDashboard, group: "general", roles: ["SUPER_ADMIN", "TITULAIRE", "VENDEUR", "CAISSIER"] },
  { key: "pos", path: "pos", icon: ShoppingCart, group: "general", roles: ["TITULAIRE", "VENDEUR", "CAISSIER"] },
  { key: "sales", path: "ventes", icon: Receipt, group: "general", roles: ["TITULAIRE", "VENDEUR", "CAISSIER"] },
  { key: "medicines", path: "medicaments", icon: Pill, group: "general", roles: ["TITULAIRE", "VENDEUR"] },
  { key: "stock", path: "stock", icon: Package, group: "general", roles: ["TITULAIRE", "VENDEUR"] },
  { key: "inventory", path: "inventaire", icon: ClipboardCheck, group: "general", roles: ["TITULAIRE", "VENDEUR"] },

  // ─── Clients & Ventes ───────────────────────────────────────
  { key: "clients", path: "clients", icon: Users, group: "clients_sales", roles: ["TITULAIRE", "VENDEUR"] },
  { key: "prescriptions", path: "ordonnances", icon: FileText, group: "clients_sales", roles: ["TITULAIRE"], badgeKey: "prescriptions" },
  { key: "purchases", path: "achats", icon: ShoppingBag, group: "clients_sales", roles: ["TITULAIRE"] },
  { key: "suppliers", path: "fournisseurs", icon: Truck, group: "clients_sales", roles: ["TITULAIRE"] },

  // ─── Administration ─────────────────────────────────────────
  { key: "reports", path: "rapports", icon: BarChart3, group: "admin", roles: ["TITULAIRE"] },
  { key: "invoices", path: "factures", icon: FileSpreadsheet, group: "admin", roles: ["TITULAIRE"] },
  { key: "controlled", path: "stupefiants", icon: Pin, group: "admin", roles: ["TITULAIRE"] },
  { key: "insurance", path: "assurances", icon: Shield, group: "admin", roles: ["TITULAIRE"] },
  {
    key: "notifications",
    path: "notifications",
    icon: Bell,
    group: "admin",
    roles: ["SUPER_ADMIN", "TITULAIRE", "VENDEUR", "CAISSIER"],
    badgeKey: "notifications",
  },
  { key: "users", path: "utilisateurs", icon: UserIcon, group: "admin", roles: ["SUPER_ADMIN", "TITULAIRE"] },
  { key: "settings", path: "parametres", icon: SettingsIcon, group: "admin", roles: ["SUPER_ADMIN", "TITULAIRE"] },
  { key: "audit", path: "audit", icon: ScrollText, group: "admin", roles: ["SUPER_ADMIN", "TITULAIRE"] },

  // ─── Modules complémentaires ────────────────────────────────
  { key: "caisse", path: "caisse", icon: Banknote, group: "modules", roles: ["TITULAIRE", "CAISSIER"] },
];

/** Items filtrés pour un rôle, groupés par section. */
export function getNavForRole(role: Role) {
  const filtered = NAV_ITEMS.filter((i) => i.roles.includes(role));
  return {
    general: filtered.filter((i) => i.group === "general"),
    clients_sales: filtered.filter((i) => i.group === "clients_sales"),
    admin: filtered.filter((i) => i.group === "admin"),
    modules: filtered.filter((i) => i.group === "modules"),
  };
}
