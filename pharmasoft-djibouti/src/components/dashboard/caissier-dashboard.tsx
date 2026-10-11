import Link from "next/link";
import { Banknote, Receipt, ShoppingCart, ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/charts/kpi-card";
import { DonutChartCard } from "@/components/charts/donut-chart-card";
import { PageHeader } from "@/components/common/page-header";
import { getCurrentCashSession, getCashierTodayBreakdown } from "@/lib/dashboard";
import { fmtMoney, fmtDateTime } from "@/lib/utils";

// PHARMASOFT — Dashboard CAISSIER : focus session de caisse + ventilation paiements.
export async function CaissierDashboard({ userName, locale }: { userName: string; locale: string }) {
  const [cashSession, breakdown] = await Promise.all([
    getCurrentCashSession(),
    getCashierTodayBreakdown(),
  ]);

  return (
    <div>
      <PageHeader title="Caisse" description={`Bonjour ${userName} — état de votre poste`} />

      {/* État de la session */}
      <Card className="mb-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="grid h-14 w-14 place-items-center rounded-xl"
              style={{
                background: cashSession ? "#22C55E20" : "hsl(var(--bg-sunken-hsl))",
                color: cashSession ? "#22C55E" : "hsl(var(--text-muted-hsl))",
              }}
            >
              <Banknote size={28} />
            </div>
            <div>
              <h2 className="t-h3">Session de caisse</h2>
              {cashSession ? (
                <p className="t-muted text-sm">
                  Ouverte depuis {fmtDateTime(cashSession.openedAt)} par {cashSession.cashierName}
                </p>
              ) : (
                <p className="t-muted text-sm">Aucune session ouverte actuellement.</p>
              )}
            </div>
          </div>
          {cashSession ? (
            <Badge variant="success" dot>
              Ouverte
            </Badge>
          ) : (
            <Badge variant="neutral" dot>
              Fermée
            </Badge>
          )}
        </div>

        {cashSession ? (
          <>
            <div className="my-5 h-px bg-border" />
            <div className="grid gap-4 md:grid-cols-3">
              <Stat label="Montant théorique" value={fmtMoney(cashSession.expectedAmount)} mono />
              <Stat label="Transactions" value={String(cashSession.transactionsCount)} />
              <Stat label="Durée d'ouverture" value={timeSince(cashSession.openedAt)} icon={Clock} />
            </div>
            <div className="mt-5 flex gap-2">
              <Button asChild>
                <Link href={`/${locale}/pos`}>
                  <ShoppingCart size={14} /> Nouvelle vente
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${locale}/caisse`}>Voir la session</Link>
              </Button>
            </div>
          </>
        ) : (
          <Button asChild size="lg" className="mt-4">
            <Link href={`/${locale}/caisse`}>
              Ouvrir une session <ArrowRight size={16} />
            </Link>
          </Button>
        )}
      </Card>

      {/* KPI du jour */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <KpiCard
          label="Encaissé aujourd'hui"
          value={fmtMoney(breakdown.totalAmount)}
          icon={Banknote}
          accent="#22C55E"
        />
        <KpiCard
          label="Tickets aujourd'hui"
          value={String(breakdown.transactionsCount)}
          icon={Receipt}
          accent="#0EA5E9"
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* Répartition paiements */}
        {breakdown.breakdown.length > 0 ? (
          <DonutChartCard
            title="Modes de paiement"
            subtitle="Répartition du jour"
            data={breakdown.breakdown}
            centerValue={String(breakdown.transactionsCount)}
            centerLabel="tickets"
          />
        ) : (
          <Card className="p-5">
            <h3 className="t-h4 mb-3">Modes de paiement</h3>
            <p className="t-muted py-8 text-center text-sm">Aucune transaction aujourd'hui.</p>
          </Card>
        )}

        {/* Derniers tickets */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="t-h4 m-0">Derniers tickets</h3>
            <Link href={`/${locale}/pos`} className="text-sm font-medium text-primary hover:underline">
              Encaisser →
            </Link>
          </div>
          {breakdown.latestSales.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Pas encore de tickets aujourd'hui.</p>
          ) : (
            <div>
              {breakdown.latestSales.map((s, i) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between gap-3 py-2.5 ${
                    i < breakdown.latestSales.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted">
                      <Receipt size={14} className="text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-sm font-semibold">{s.ticketNumber}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {s.client?.name ?? "Client occasionnel"} · {paymentLabel(s.paymentMethod)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold">{fmtMoney(s.total)}</div>
                    <div className="text-[11px] text-muted-foreground">{fmtTime(s.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  mono,
  icon: Icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: typeof Clock;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 flex items-center gap-1.5 text-xl font-bold ${mono ? "font-mono" : ""}`}>
        {Icon ? <Icon size={16} className="text-muted-foreground" /> : null}
        {value}
      </div>
    </div>
  );
}

function paymentLabel(m: string): string {
  return (
    {
      CASH: "Espèces",
      CARD: "Carte",
      DMONEY: "D-Money",
      WAAFI: "Waafi",
      INSURANCE: "Assurance",
      CREDIT: "Crédit",
      MIXED: "Mixte",
    } as Record<string, string>
  )[m] ?? m;
}

function timeSince(date: Date): string {
  const ms = Date.now() - date.getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

function fmtTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date);
}
