"use client";

import type { Role } from "@prisma/client";
import { Shield, Stethoscope, ShoppingBag, Banknote } from "lucide-react";
import { useTranslations } from "next-intl";
import { ROLE_THEME } from "@/lib/permissions";

const ROLE_ICON = {
  SUPER_ADMIN: Shield,
  TITULAIRE: Stethoscope,
  VENDEUR: ShoppingBag,
  CAISSIER: Banknote,
} as const;

// PHARMASOFT — Pastille de rôle avec couleur métier.
export function RoleBadge({ role, size = "default" }: { role: Role; size?: "default" | "sm" }) {
  const theme = ROLE_THEME[role];
  const Icon = ROLE_ICON[role];
  const t = useTranslations("roles");
  const isSm = size === "sm";
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full font-semibold"
      style={{
        background: `${theme.color}15`,
        color: theme.color,
        border: `1px solid ${theme.color}`,
        padding: isSm ? "2px 8px 2px 2px" : "4px 10px 4px 4px",
        fontSize: isSm ? 11 : 13,
      }}
    >
      <span
        className="grid place-items-center rounded-full text-white"
        style={{
          background: theme.color,
          width: isSm ? 18 : 22,
          height: isSm ? 18 : 22,
        }}
      >
        <Icon size={isSm ? 10 : 12} />
      </span>
      <span>{t(role)}</span>
    </span>
  );
}
