"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { resourceFromPath } from "@/lib/permissions";

// PHARMASOFT — Breadcrumbs auto-générés depuis le pathname courant.
// Le premier segment est toujours "Tableau de bord". Les pages détail
// (avec param `[id]`) pourront override via prop dans une future itération.
export function Breadcrumbs() {
  const locale = useLocale();
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const rtl = locale === "ar";

  // Strip /{locale} prefix
  const segments = pathname.replace(/^\/(fr|ar|en)(?=\/|$)/, "").split("/").filter(Boolean);

  const crumbs: Array<{ label: string; href?: string }> = [{ label: tNav("dashboard"), href: `/${locale}/dashboard` }];

  if (segments.length > 0) {
    const resource = resourceFromPath(pathname);
    if (resource) {
      const map: Record<string, string> = {
        pos: "pos",
        caisse: "caisse",
        medicines: "medicines",
        stock: "stock",
        clients: "clients",
        prescriptions: "prescriptions",
        suppliers: "suppliers",
        reports: "reports",
        insurance: "insurance",
        notifications: "notifications",
        users: "users",
        settings: "settings",
        "audit-log": "audit",
        dashboard: "dashboard",
      };
      const key = map[resource];
      if (key && key !== "dashboard") {
        crumbs.push({ label: tNav(key) });
      }
    } else if (segments[0]) {
      // Slug non géré (page custom)
      crumbs.push({ label: segments[0] });
    }
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground" dir={rtl ? "rtl" : "ltr"}>
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 ? <ChevronRight size={14} className="text-[#94A3B8]" /> : null}
          {c.href && i < crumbs.length - 1 ? (
            <Link href={c.href} className="hover:text-foreground">
              {c.label}
            </Link>
          ) : (
            <span className={i === crumbs.length - 1 ? "font-medium text-foreground" : ""}>{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
