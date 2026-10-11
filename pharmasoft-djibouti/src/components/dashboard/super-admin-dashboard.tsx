import Link from "next/link";
import {
  Users as UsersIcon,
  Database,
  ShieldCheck,
  ScrollText,
  Pill,
  ShoppingCart,
  UserCircle,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KpiCard } from "@/components/charts/kpi-card";
import { PageHeader } from "@/components/common/page-header";
import { getSystemHealth } from "@/lib/dashboard";
import { ROLE_THEME } from "@/lib/permissions";
import { fmtDateTime, initials } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
  LOGIN_FAILED: "Échec connexion",
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  STOCK_ADJUST: "Ajustement stock",
  SALE_COMPLETE: "Vente encaissée",
  SALE_CANCEL: "Vente annulée",
  PRESCRIPTION_VALIDATE: "Validation ordonnance",
  PRESCRIPTION_REJECT: "Rejet ordonnance",
  PRICE_CHANGE: "Changement prix",
  REPORT_VIEW: "Consult. rapport",
  BACKUP_CREATE: "Sauvegarde",
  SETTINGS_UPDATE: "Modif. paramètres",
};

// PHARMASOFT — Dashboard SUPER_ADMIN : santé technique du système.
// Pas de CA, pas de stock — uniquement utilisateurs, audit, sauvegardes (D-012).
export async function SuperAdminDashboard({ userName, locale }: { userName: string; locale: string }) {
  const health = await getSystemHealth();

  return (
    <div>
      <PageHeader
        title="Administration système"
        description={`Connecté en tant que ${userName} — vue technique`}
      />

      {/* KPIs techniques */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Utilisateurs actifs"
          value={String(health.users.active)}
          icon={UsersIcon}
          accent="#8B5CF6"
        />
        <KpiCard label="Médicaments (catalogue)" value={String(health.counts.medicines)} icon={Pill} accent="#0EA5E9" />
        <KpiCard
          label="Ventes (historique)"
          value={health.counts.sales.toLocaleString("fr-FR")}
          icon={ShoppingCart}
          accent="#10B981"
        />
        <KpiCard label="Clients (base)" value={String(health.counts.clients)} icon={UserCircle} accent="#F59E0B" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {/* Connexions récentes */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="t-h4 m-0">Connexions récentes (24h)</h3>
            <Link
              href={`/${locale}/audit`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Voir l'audit →
            </Link>
          </div>
          {health.recentLogins.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucune connexion récente.</p>
          ) : (
            <div>
              {health.recentLogins.map((l, i) => {
                const u = l.user;
                if (!u) return null;
                const theme = ROLE_THEME[u.role];
                return (
                  <div
                    key={l.id}
                    className={`flex items-center gap-3 py-2.5 ${
                      i < health.recentLogins.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <Avatar style={{ background: theme.color }}>
                      <AvatarFallback style={{ background: theme.color }} className="text-xs">
                        {initials(u.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{theme.label}</div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <LogIn size={12} className="mr-1 inline" />
                      {fmtDateTime(l.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Journal d'audit récent */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="t-h4 m-0">Journal d'audit récent</h3>
            <Badge variant="primary">{health.auditPreview.length} entrées</Badge>
          </div>
          {health.auditPreview.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucune entrée d'audit.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {health.auditPreview.map((entry) => (
                <div key={entry.id} className="flex items-center gap-2.5 rounded-md bg-muted/40 p-2.5 text-sm">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-card">
                    <ScrollText size={13} className="text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      {ACTION_LABELS[entry.action] ?? entry.action}{" "}
                      {entry.resource ? (
                        <span className="text-muted-foreground">· {entry.resource}</span>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.user?.name ?? "Système"} · {fmtDateTime(entry.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Stats utilisateurs + santé */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <UsersIcon size={18} className="text-muted-foreground" />
            <h3 className="t-h4 m-0">Utilisateurs</h3>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-bold">{health.users.total}</div>
              <div className="text-xs text-muted-foreground">total comptes</div>
            </div>
            <div className="text-right">
              <Badge variant="success">{health.users.active} actifs</Badge>
              {health.users.inactive > 0 ? (
                <div className="mt-1 text-xs text-muted-foreground">{health.users.inactive} désactivés</div>
              ) : null}
            </div>
          </div>
          <Link
            href={`/${locale}/utilisateurs`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Gérer les comptes <ArrowRight size={14} />
          </Link>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Database size={18} className="text-muted-foreground" />
            <h3 className="t-h4 m-0">Base de données</h3>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Médicaments</span>
              <span className="font-mono font-semibold">{health.counts.medicines}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clients</span>
              <span className="font-mono font-semibold">{health.counts.clients}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ventes historiques</span>
              <span className="font-mono font-semibold">{health.counts.sales}</span>
            </div>
          </div>
          <Link
            href={`/${locale}/parametres`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Sauvegardes <ArrowRight size={14} />
          </Link>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-muted-foreground" />
            <h3 className="t-h4 m-0">Conformité</h3>
          </div>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Audit log actif</span>
              <Badge variant="success" className="text-[10px]">
                Oui
              </Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">PIN Titulaire défini</span>
              <Badge variant="success" className="text-[10px]">
                Oui
              </Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Mots de passe hashés</span>
              <Badge variant="success" className="text-[10px]">
                bcrypt
              </Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Sessions JWT</span>
              <Badge variant="primary" className="text-[10px]">
                12h
              </Badge>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
