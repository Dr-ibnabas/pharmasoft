"use client";

import { useLocale, useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import type { Role } from "@prisma/client";
import { ChevronDown, User as UserIcon, Settings, Key, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/utils";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    role: Role;
    avatarColor?: string | null;
  };
}

// PHARMASOFT — Menu utilisateur (avatar + dropdown).
export function UserMenu({ user }: UserMenuProps) {
  const locale = useLocale();
  const t = useTranslations("common");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2 transition-colors hover:bg-muted">
        <Avatar className="h-7 w-7" style={{ background: user.avatarColor ?? "#0EA5E9" }}>
          <AvatarFallback className="text-[11px]" style={{ background: user.avatarColor ?? "#0EA5E9" }}>
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <ChevronDown size={14} className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <div className="border-b px-3 py-2.5">
          <div className="text-[13px] font-semibold">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
        <DropdownMenuItem className="cursor-pointer">
          <UserIcon size={15} />
          {t("profile")}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings size={15} />
          {t("settings")}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Key size={15} />
          {t("change_password")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="cursor-pointer text-[#EF4444] focus:bg-[#FEE2E2]/40 focus:text-[#EF4444] dark:focus:bg-[#EF4444]/15"
        >
          <LogOut size={15} />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
