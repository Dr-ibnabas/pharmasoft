import Link from "next/link";
import { Receipt, ShoppingCart, Package, UserPlus, AlertTriangle, ArrowRight, Pill } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/charts/kpi-card";
import { MedImage } from "@/components/charts/med-image";
import { PageHeader } from "@/components/common/page-header";
import { getVendorActivity, getStockAlerts } from "@/lib/dashboard";
import { fmtDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

// PHARMASOFT — Dashboard VENDEUR.
// Pas de chiffre d'affaires ni de marge (D-013). Focus sur l'activité opérationnelle.
export async function VendeurDashboard({
  userId,
  userName,
  locale,
}: {
  userId: string;
  userName: string;
  locale: string;
}) {
  const [activity, alerts, lowStock] = await Promise.all([
    getVendorActivity(userId),
    getStockAlerts(),
    prisma.lot.findMany({
      where: { quantity: { gt: 0, lte: 20 } },
      include: { medicine: { select: { name: true, form: true, laboratory: true } } },
      orderBy: { quantity: "asc" },
      take: 5,
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Mon activité"
        description={`Bienvenue ${userName} — vue de votre journée`}
      />

      {/* KPI : pas de Fdj, juste compteurs */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Tickets du jour"
          value={String(activity.todayTickets)}
          delta={
            activity.yesterdayTickets > 0
              ? `${activity.todayTickets >= activity.yesterdayTickets ? "+" : ""}${activity.todayTickets - activity.yesterdayTickets}`
              : undefined
          }
          deltaDir={activity.todayTickets >= activity.yesterdayTickets ? "up" : "down"}
          icon={Receipt}
          accent="#10B981"
        />
        <KpiCard
          label="Unités vendues"
          value={String(activity.todayUnits)}
          icon={Package}
          accent="#0EA5E9"
        />
        <KpiCard
          label="Alertes stock"
          value={String(alerts.lowStock + alerts.outOfStock)}
          icon={AlertTriangle}
          accent="#F59E0B"
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Mes ventes récentes */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="t-h4 m-0">Mes dernières ventes</h3>
            <Link href={`/${locale}/pos`} className="text-sm font-medium text-primary hover:underline">
              Nouvelle vente →
            </Link>
          </div>
          {activity.recentSales.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucune vente récente.</p>
          ) : (
            <div>
              {activity.recentSales.map((s, i) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 py-3 ${
                    i < activity.recentSales.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted">
                    <Receipt size={16} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">{s.ticketNumber}</span>
                      {s.client ? (
                        <Badge variant="neutral" className="text-[10px]">
                          {s.client.name}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="line-clamp-1 text-xs text-muted-foreground">
                      {s.lines.map((l) => `${l.medicine.name} ×${l.quantity}`).join(", ")}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">{fmtDateTime(s.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Alertes stock utiles à la vente */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="t-h4 m-0">Stock à surveiller</h3>
            <Badge variant="warning">{lowStock.length}</Badge>
          </div>
          {lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Aucun stock critique.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {lowStock.map((l) => (
                <div key={l.id} className="flex items-center gap-2.5 rounded-md bg-muted/40 p-2.5">
                  <MedImage name={l.medicine.name} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{l.medicine.name}</div>
                    <div className="text-[11px] text-muted-foreground">{l.medicine.laboratory}</div>
                  </div>
                  <Badge variant="warning" className="font-mono">
                    {l.quantity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Raccourcis */}
      <h3 className="t-h4 mb-3">Raccourcis</h3>
      <div className="grid gap-3 md:grid-cols-3">
        <Link
          href={`/${locale}/pos`}
          className="group flex items-center gap-3.5 rounded-lg border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-p-md"
        >
          <div
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg"
            style={{ background: "#0EA5E920", color: "#0EA5E9" }}
          >
            <ShoppingCart size={22} />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Nouvelle vente</div>
            <div className="text-xs text-muted-foreground">Commencer un ticket</div>
          </div>
          <ArrowRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href={`/${locale}/clients`}
          className="group flex items-center gap-3.5 rounded-lg border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-p-md"
        >
          <div
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg"
            style={{ background: "#10B98120", color: "#10B981" }}
          >
            <UserPlus size={22} />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Nouveau client</div>
            <div className="text-xs text-muted-foreground">Créer une fiche</div>
          </div>
          <ArrowRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href={`/${locale}/medicaments`}
          className="group flex items-center gap-3.5 rounded-lg border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-p-md"
        >
          <div
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg"
            style={{ background: "#8B5CF620", color: "#8B5CF6" }}
          >
            <Pill size={22} />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Consulter le catalogue</div>
            <div className="text-xs text-muted-foreground">Rechercher un médicament</div>
          </div>
          <ArrowRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <Card className="mt-6 border-dashed bg-muted/30 p-4 text-xs text-muted-foreground">
        <strong>Note :</strong> en tant que vendeur, vous ne voyez pas les prix d'achat ni les marges
        (réservés au pharmacien titulaire — cf. politique interne).
      </Card>
    </div>
  );
}
