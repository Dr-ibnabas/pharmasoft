"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Role } from "@prisma/client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";
import { getNavForRole, type NavGroup, type NavItem } from "@/lib/nav";
import { cn, initials } from "@/lib/utils";

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarColor?: string | null;
  };
  pharmacy: {
    name: string;
    nif: string;
  };
  badges?: Partial<Record<"prescriptions" | "notifications", number>>;
}

// PHARMASOFT — Sidebar adaptative par rôle.
// Filtre les items via getNavForRole(role), groupe par section.
export function Sidebar({ user, pharmacy, badges }: SidebarProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const groups = getNavForRole(user.role);

  // Détection de la section active (path commence par /{locale}/{slug})
  const isActive = (path: string) => {
    const full = `/${locale}/${path}`;
    return pathname === full || pathname.startsWith(`${full}/`);
  };

  const sectionOrder: Array<{ group: NavGroup; titleKey: string; items: NavItem[] }> = [
    { group: "general", titleKey: "section_general", items: groups.general },
    { group: "clients_sales", titleKey: "section_clients_sales", items: groups.clients_sales },
    { group: "admin", titleKey: "section_admin", items: groups.admin },
    { group: "modules", titleKey: "section_modules", items: groups.modules },
  ];

  return (
    <aside className="pharma-sidebar sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r bg-card">
      {/* Logo + nom pharmacie */}
      <div className="border-b px-5 pb-3 pt-5">
        <div className="flex items-center gap-2.5">
          <Logo size={36} />
          <div className="min-w-0">
            <div className="text-[15px] font-bold tracking-tight">PHARMASOFT</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Djibouti</div>
          </div>
        </div>
        <div className="mt-3 rounded-md bg-muted/60 px-2.5 py-2 text-xs">
          <div className="font-semibold">{pharmacy.name}</div>
          <div className="text-[11px] text-muted-foreground">NIF · {pharmacy.nif}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {sectionOrder.map(({ group, titleKey, items }) =>
          items.length === 0 ? null : (
            <div key={group} className="mb-2">
              <div className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {tNav(titleKey)}
              </div>
              {items.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                const badge = item.badgeKey ? badges?.[item.badgeKey] : undefined;
                return (
                  <Link
                    key={item.key}
                    href={`/${locale}/${item.path}`}
                    className={cn(
                      "relative my-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-[#E0F2FE] text-[#0284C7] dark:bg-primary/15 dark:text-primary"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        "shrink-0",
                        active ? "text-[#0284C7] dark:text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className="flex-1">{tNav(item.key)}</span>
                    {badge && badge > 0 ? (
                      <span className="ms-auto min-w-[18px] rounded-full bg-[#EF4444] px-1.5 text-center text-[10px] font-semibold leading-[18px] text-white">
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ),
        )}
      </nav>

      {/* User block + logout */}
      <div className="flex items-center gap-2.5 border-t p-3">
        <Avatar style={{ background: user.avatarColor ?? "#0EA5E9" }}>
          <AvatarFallback style={{ background: user.avatarColor ?? "#0EA5E9" }}>
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold">{user.name}</div>
          <div className="truncate text-[11px] text-muted-foreground">{user.email}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          title={tCommon("logout")}
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
