import Link from "next/link";
import {
  Banknote,
  BarChart3,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  Package,
  X,
  Clock,
  Pill,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/charts/kpi-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { DonutChartCard } from "@/components/charts/donut-chart-card";
import { MedImage } from "@/components/charts/med-image";
import { PageHeader } from "@/components/common/page-header";
import {
  getRevenueKpis,
  getSalesLast7Days,
  getCategoryMix,
  getTopMedicinesToday,
  getStockAlerts,
  getCurrentCashSession,
} from "@/lib/dashboard";
import { fmtMoney } from "@/lib/utils";

// PHARMASOFT — Dashboard TITULAIRE.
// Tableau de bord opérationnel complet : CA, alertes, top médicaments, caisse.
export async function TitulaireDashboard({ userName, locale }: { userName: string; locale: string }) {
  const [kpis, sales7d, categoryMix, topMeds, alerts, cashSession] = await Promise.all([
    getRevenueKpis(),
    getSalesLast7Days(),
    getCategoryMix(),
    getTopMedicinesToday(5),
    getStockAlerts(),
    getCurrentCashSession(),
  ]);

  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description={`${today.charAt(0).toUpperCase() + today.slice(1)} — Bienvenue ${userName}`}
        actions={
          <Button variant="outline">
            <BarChart3 size={14} /> Exporter
          </Button>
        }
      />

      {/* KPI row */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="CA du jour"
          value={fmtMoney(kpis.today.total)}
          delta={kpis.today.delta}
          deltaDir={kpis.today.dir}
          icon={Banknote}
          accent="#0EA5E9"
        />
        <KpiCard
          label="CA semaine"
          value={fmtMoney(kpis.week.total)}
          delta={kpis.week.delta}
          deltaDir={kpis.week.dir}
          deltaSuffix="vs sem. précédente"
          icon={TrendingUp}
          accent="#10B981"
        />
        <KpiCard
          label="CA mois"
          value={fmtMoney(kpis.month.total)}
          delta={kpis.month.delta}
          deltaDir={kpis.month.dir}
          deltaSuffix="vs mois précédent"
          icon={BarChart3}
          accent="#8B5CF6"
        />
        <KpiCard
          label="Panier moyen"
          value={fmtMoney(kpis.avgBasket.value)}
          icon={ShoppingCart}
          accent="#F59E0B"
        />
      </div>

      {/* Charts row */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <BarChartCard
          title="Ventes — 7 derniers jours"
          subtitle="En Fdj. La barre verte est aujourd'hui."
          data={sales7d}
          legend={
            <>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9]" /> Cette sem.
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" /> Aujourd'hui
              </span>
            </>
          }
        />
        <DonutChartCard
          title="Mix par catégorie"
          subtitle="Répartition CA des 30 derniers jours"
          data={categoryMix}
          centerValue={String(categoryMix.length)}
          centerLabel="catégories"
        />
      </div>

      {/* Top meds + Alerts + Caisse */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="t-h4 m-0">Top 5 médicaments du jour</h3>
            <Link
              href={`/${locale}/medicaments`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Voir tous →
            </Link>
          </div>
          {topMeds.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Aucune vente aujourd'hui.</p>
          ) : (
            <div>
              {topMeds.map((m, i) => (
                <div
                  key={m.medicineId}
                  className={`flex items-center gap-3 py-3 ${
                    i < topMeds.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                      i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <MedImage name={m.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.qty} unités vendues</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold">{fmtMoney(m.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          {/* Alertes */}
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="t-h4 m-0">Alertes en cours</h3>
              <Badge variant="destructive">{alerts.total} actives</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <AlertBox
                count={alerts.expiryUrgent}
                label="Péremption urgente"
                sub="≤ 30 jours"
                icon={AlertCircle}
                tone="danger"
              />
              <AlertBox
                count={alerts.expiryNear}
                label="Péremption proche"
                sub="≤ 90 jours"
                icon={AlertTriangle}
                tone="warning"
              />
              <AlertBox
                count={alerts.lowStock}
                label="Stock faible"
                sub="Sous le seuil"
                icon={Package}
                tone="danger"
              />
              <AlertBox
                count={alerts.outOfStock}
                label="Rupture de stock"
                sub="À recommander"
                icon={X}
                tone="neutral"
              />
            </div>
          </Card>

          {/* État caisse */}
          {cashSession ? (
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="t-h4 m-0">État de la caisse</h3>
                <Badge variant="success" dot>
                  Ouverte
                </Badge>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Montant théorique</div>
                  <div className="font-mono text-xl font-bold">{fmtMoney(cashSession.expectedAmount)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Transactions</div>
                  <div className="text-xl font-bold">{cashSession.transactionsCount}</div>
                </div>
              </div>
              <div className="my-3 h-px bg-border" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  Ouverte depuis {timeSince(cashSession.openedAt)}
                </span>
                <span>
                  Caissier <strong className="text-foreground">{cashSession.cashierName}</strong>
                </span>
              </div>
            </Card>
          ) : (
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="t-h4 m-0">État de la caisse</h3>
                <Badge variant="neutral" dot>
                  Fermée
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Aucune session ouverte actuellement.</p>
              <Button asChild variant="default" size="sm" className="mt-3">
                <Link href={`/${locale}/caisse`}>
                  Ouvrir une session <ArrowRight size={14} />
                </Link>
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Raccourcis */}
      <div>
        <h3 className="t-h4 mb-3">Raccourcis</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Shortcut href={`/${locale}/pos`} label="Nouvelle vente" shortcut="F2" icon={ShoppingCart} color="#0EA5E9" />
          <Shortcut href={`/${locale}/clients`} label="Nouveau client" shortcut="F3" icon={UserPlus} color="#10B981" />
          <Shortcut href={`/${locale}/medicaments`} label="Ajouter médicament" shortcut="F4" icon={Pill} color="#8B5CF6" />
          <Shortcut href={`/${locale}/stock`} label="Inventaire" shortcut="F5" icon={Package} color="#F59E0B" />
        </div>
      </div>
    </div>
  );
}

function AlertBox({
  count,
  label,
  sub,
  icon: Icon,
  tone,
}: {
  count: number;
  label: string;
  sub: string;
  icon: typeof Banknote;
  tone: "danger" | "warning" | "neutral";
}) {
  const colors = {
    danger: { bg: "#FEE2E2", iconBg: "#EF4444" },
    warning: { bg: "#FEF3C7", iconBg: "#F59E0B" },
    neutral: { bg: "hsl(var(--bg-sunken-hsl))", iconBg: "#64748B" },
  };
  const c = colors[tone];
  return (
    <div className="cursor-pointer rounded-lg border border-transparent p-3.5" style={{ background: c.bg }}>
      <div
        className="mb-2 grid h-7 w-7 place-items-center rounded-md text-white"
        style={{ background: c.iconBg }}
      >
        <Icon size={14} />
      </div>
      <div className="text-2xl font-bold leading-none">{count}</div>
      <div className="mt-1 text-xs font-medium">{label}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function Shortcut({
  href,
  label,
  shortcut,
  icon: Icon,
  color,
}: {
  href: string;
  label: string;
  shortcut: string;
  icon: typeof Banknote;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 rounded-lg border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-p-md"
    >
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-lg"
        style={{ background: `${color}20`, color }}
      >
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">
          Raccourci{" "}
          <kbd className="rounded border bg-muted px-1.5 font-mono text-[10px] font-semibold">{shortcut}</kbd>
        </div>
      </div>
      <ArrowRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

function timeSince(date: Date): string {
  const ms = Date.now() - date.getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}
