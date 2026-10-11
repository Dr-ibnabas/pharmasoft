"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import type { Role } from "@prisma/client";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { RoleBadge } from "@/components/layout/role-badge";
import {
  NotificationsMenu,
  type NotificationPreview,
} from "@/components/layout/notifications-menu";
import { Kbd } from "@/components/ui/kbd";

interface TopbarProps {
  user: {
    name: string;
    email: string;
    role: Role;
    avatarColor?: string | null;
  };
  unreadCount: number;
  recentNotifications: NotificationPreview[];
}

// PHARMASOFT — Topbar : breadcrumb + recherche globale + actions.
export function Topbar({ user, unreadCount, recentNotifications }: TopbarProps) {
  const t = useTranslations("common");

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-card px-6">
      <Breadcrumbs />

      <div className="ms-auto flex max-w-[480px] flex-1 items-center">
        <div className="relative w-full">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder={t("search_global")}
            className="h-[38px] w-full rounded-md border border-input bg-card pl-10 pr-16 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <Kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">⌘K</Kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <RoleBadge role={user.role} />
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationsMenu unreadCount={unreadCount} items={recentNotifications} />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
