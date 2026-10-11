import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { PeriodReportCard } from "@/components/rapports/report-period-form";
import { Banknote, Package, Download, Lock } from "lucide-react";
import { fmtMoney } from "@/lib/utils";

export default async function RapportsPage() {
  const session = await auth();
  if (!session?.user) return null;
  const isTitulaire = session.user.role === "TITULAIRE";

  const [totalSales, totalRevenue, claimsPending, currentSession, insurances] = await Promise.all([
    prisma.sale.count({ where: { status: "COMPLETED" } }),
    prisma.sale.aggregate({ where: { status: "COMPLETED" }, _sum: { total: true } }),
    prisma.insuranceClaim.aggregate({
      where: { status: "PENDING" },
      _sum: { amountClaimed: true },
    }),
    prisma.cashSession.findFirst({ orderBy: { openedAt: "desc" } }),
    prisma.insurance.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
  ]);

  if (!isTitulaire) {
    return (
      <div>
        <PageHeader title="Rapports & statistiques" description="Accès limité" />
        <Card className="p-10 text-center">
          <Lock size={32} className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="t-h3 mb-2">Accès réservé au Pharmacien titulaire</h2>
          <p className="t-muted">Les rapports contiennent des informations financières sensibles (CA, marges, prix d'achat).</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Rapports & statistiques"
        description="Exports PDF et Excel — réservés au Pharmacien titulaire"
      />

      {/* KPI globaux */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <KpiBox label="Ventes (historique)" value={totalSales.toLocaleString("fr-FR")} />
        <KpiBox label="CA total" value={fmtMoney(totalRevenue._sum.total ?? 0)} mono />
        <KpiBox label="Claims en attente" value={fmtMoney(claimsPending._sum.amountClaimed ?? 0)} mono />
      </div>

      {/* Rapports instantanés (1 clic) */}
      <h2 className="t-h3 mb-3">Rapports instantanés</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#10B98120] text-[#10B981]">
                <Banknote size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Z journalier</h3>
                <p className="text-xs text-muted-foreground">Fin de session caisse — PDF</p>
              </div>
            </div>
            <Badge variant="primary">PDF</Badge>
          </div>
          {currentSession ? (
            <Button asChild>
              <Link href={`/api/reports/z-journalier?sessionId=${currentSession.id}`} target="_blank">
                <Download size={14} /> Télécharger
              </Link>
            </Button>
          ) : (
            <Button disabled>Aucune session</Button>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#F59E0B20] text-[#F59E0B]">
                <Package size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Valorisation stock</h3>
                <p className="text-xs text-muted-foreground">État + valeur PA/PV par produit — Excel</p>
              </div>
            </div>
            <Badge variant="warning">Excel</Badge>
          </div>
          <Button asChild>
            <Link href="/api/reports/stock-valuation" target="_blank">
              <Download size={14} /> Télécharger
            </Link>
          </Button>
        </Card>
      </div>

      {/* Rapports avec période */}
      <h2 className="t-h3 mb-3">Rapports périodiques</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <PeriodReportCard
          title="Journal des ventes"
          description="Toutes les ventes sur la période — 2 feuilles (résumé + lignes)"
          endpoint="sales"
        />
        <PeriodReportCard
          title="Bordereau assurance"
          description="Génère le bordereau mensuel d'un assureur"
          endpoint="insurance"
          insurances={insurances}
        />
      </div>
    </div>
  );
}

function KpiBox({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${mono ? "font-mono" : ""}`}>{value}</div>
    </Card>
  );
}
