import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";

// PHARMASOFT — Layout des routes authentifiées.
// Le middleware a déjà vérifié l'auth, mais on relit la session ici pour
// passer l'utilisateur (et ses préchargements) à l'AppShell.
export default async function AppGroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Pré-fetch des informations affichées dans le shell (pharmacie + badges + récap notif).
  const [setting, notifCount, recentNotifs, pendingPrescriptions] = await Promise.all([
    prisma.setting.findFirst(),
    prisma.notification.count({
      where: {
        isRead: false,
        OR: [{ userId: session.user.id }, { userId: null }],
      },
    }),
    prisma.notification.findMany({
      where: {
        OR: [{ userId: session.user.id }, { userId: null }],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.prescription.count({ where: { status: "PENDING" } }),
  ]);

  const pharmacy = setting
    ? { name: setting.pharmacyName, nif: setting.nif }
    : { name: "Pharmacie Centrale Djibouti", nif: "12345-A" };

  return (
    <AppShell
      user={{
        id: session.user.id,
        name: session.user.name ?? session.user.email ?? "—",
        email: session.user.email ?? "",
        role: session.user.role,
        avatarColor: session.user.avatarColor ?? null,
      }}
      pharmacy={pharmacy}
      badges={{
        notifications: notifCount,
        prescriptions: pendingPrescriptions,
      }}
      unreadCount={notifCount}
      recentNotifications={recentNotifs.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        createdAt: n.createdAt.toISOString(),
        isRead: n.isRead,
      }))}
    >
      {children}
    </AppShell>
  );
}
