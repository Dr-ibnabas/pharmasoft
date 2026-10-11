import { auth } from "@/lib/auth";
import { TitulaireDashboard } from "@/components/dashboard/titulaire-dashboard";
import { VendeurDashboard } from "@/components/dashboard/vendeur-dashboard";
import { CaissierDashboard } from "@/components/dashboard/caissier-dashboard";
import { SuperAdminDashboard } from "@/components/dashboard/super-admin-dashboard";

// PHARMASOFT — Dispatcher du tableau de bord.
// Chaque rôle a sa propre variante avec sa propre logique de données.
// La page est accessible à TOUS les rôles (cf. permissions D-012/D-013/D-014 ajustées
// pour exposer /dashboard partout, le contenu adapte la sensibilité financière).
export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const session = await auth();
  if (!session?.user) return null; // middleware redirige

  const userName = session.user.name ?? session.user.email ?? "—";

  switch (session.user.role) {
    case "SUPER_ADMIN":
      return <SuperAdminDashboard userName={userName} locale={locale} />;
    case "TITULAIRE":
      return <TitulaireDashboard userName={userName} locale={locale} />;
    case "VENDEUR":
      return <VendeurDashboard userId={session.user.id} userName={userName} locale={locale} />;
    case "CAISSIER":
      return <CaissierDashboard userName={userName} locale={locale} />;
    default:
      return null;
  }
}
