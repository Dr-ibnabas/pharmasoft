import type { Role } from "@prisma/client";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { NotificationPreview } from "@/components/layout/notifications-menu";

interface AppShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarColor?: string | null;
  };
  pharmacy: { name: string; nif: string };
  badges: { notifications?: number; prescriptions?: number };
  unreadCount: number;
  recentNotifications: NotificationPreview[];
  children: React.ReactNode;
}

// PHARMASOFT — Coquille principale (sidebar + topbar + contenu).
// Server component : reçoit toutes les données pré-fetchées du layout.
export function AppShell({
  user,
  pharmacy,
  badges,
  unreadCount,
  recentNotifications,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} pharmacy={pharmacy} badges={badges} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} unreadCount={unreadCount} recentNotifications={recentNotifications} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
