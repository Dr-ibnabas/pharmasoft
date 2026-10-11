"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Bell, AlertTriangle, AlertCircle, Package, ShoppingCart, Truck, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fmtDate } from "@/lib/utils";

export interface NotificationPreview {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  createdAt: string;        // ISO
  isRead: boolean;
}

const ICONS: Record<string, { icon: typeof Bell; color: string }> = {
  STOCK_LOW: { icon: Package, color: "#F59E0B" },
  STOCK_OUT: { icon: Package, color: "#EF4444" },
  EXPIRY_NEAR: { icon: AlertTriangle, color: "#F59E0B" },
  EXPIRY_URGENT: { icon: AlertCircle, color: "#EF4444" },
  SALE_COMPLETED: { icon: ShoppingCart, color: "#22C55E" },
  ORDER_RECEIVED: { icon: Truck, color: "#0EA5E9" },
  PRESCRIPTION_PENDING: { icon: CheckCircle2, color: "#8B5CF6" },
  SYSTEM: { icon: Bell, color: "#64748B" },
};

// PHARMASOFT — Menu déroulant notifications (topbar).
export function NotificationsMenu({
  unreadCount,
  items,
}: {
  unreadCount: number;
  items: NotificationPreview[];
}) {
  const locale = useLocale();
  const t = useTranslations("common");
  const tNotif = useTranslations("notifications");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative grid h-[38px] w-[38px] place-items-center rounded-md text-foreground transition-colors hover:bg-muted">
        <Bell size={18} />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full border-2 border-card bg-[#EF4444] px-[3px] text-[9px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b px-3.5 py-3">
          <strong className="text-sm">{t("notifications")}</strong>
          {unreadCount > 0 ? (
            <button className="text-xs font-medium text-primary hover:underline">{t("mark_all_read")}</button>
          ) : null}
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">{tNotif("empty")}</div>
          ) : (
            items.map((n) => {
              const cfg = ICONS[n.type] ?? ICONS["SYSTEM"]!;
              const Icon = cfg.icon;
              return (
                <Link
                  key={n.id}
                  href={`/${locale}/notifications`}
                  className="flex gap-2.5 border-b px-3.5 py-3 transition-colors last:border-0 hover:bg-muted"
                >
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md"
                    style={{ background: `${cfg.color}20`, color: cfg.color }}
                  >
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium leading-tight">{n.title}</div>
                    <div className="line-clamp-1 text-[11px] text-muted-foreground">{n.message}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{fmtDate(n.createdAt)}</div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
        <div className="border-t p-2 text-center">
          <Link
            href={`/${locale}/notifications`}
            className="text-xs font-medium text-primary hover:underline"
          >
            {t("view_all")} →
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
