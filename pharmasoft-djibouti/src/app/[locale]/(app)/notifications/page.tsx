import { useTranslations } from "next-intl";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { fmtDateTime } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Bell, Package, ShoppingCart, Truck } from "lucide-react";

const ICONS: Record<string, { icon: typeof Bell; color: string }> = {
  STOCK_LOW: { icon: Package, color: "#F59E0B" },
  STOCK_OUT: { icon: Package, color: "#EF4444" },
  EXPIRY_NEAR: { icon: AlertTriangle, color: "#F59E0B" },
  EXPIRY_URGENT: { icon: AlertCircle, color: "#EF4444" },
  SALE_COMPLETED: { icon: ShoppingCart, color: "#22C55E" },
  ORDER_RECEIVED: { icon: Truck, color: "#0EA5E9" },
  SYSTEM: { icon: Bell, color: "#64748B" },
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const notifications = await prisma.notification.findMany({
    where: {
      OR: [{ userId: session.user.id }, { userId: null }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return <NotificationsList notifications={notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    createdAt: n.createdAt.toISOString(),
  }))} />;
}

function NotificationsList({
  notifications,
}: {
  notifications: { id: string; type: string; title: string; message: string; createdAt: string }[];
}) {
  const t = useTranslations("nav");
  const tNotif = useTranslations("notifications");

  return (
    <div>
      <h1 className="t-h1 mb-6">{t("notifications")}</h1>
      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="t-muted">{tNotif("empty")}</p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y">
            {notifications.map((n) => {
              const cfg = ICONS[n.type] ?? ICONS["SYSTEM"]!;
              const Icon = cfg.icon;
              return (
                <div key={n.id} className="flex gap-3 p-4">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-md"
                    style={{ background: `${cfg.color}20`, color: cfg.color }}
                  >
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-sm text-muted-foreground">{n.message}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{fmtDateTime(n.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
