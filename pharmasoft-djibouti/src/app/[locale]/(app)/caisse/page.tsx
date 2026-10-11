import { Banknote, Lock, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { OpenSessionDialog, CloseSessionDialog } from "@/components/caisse/cash-session-dialogs";
import { fmtMoney, fmtDateTime } from "@/lib/utils";

export default async function CaissePage() {
  const session = await auth();
  if (!session?.user) return null;

  const current = await prisma.cashSession.findFirst({
    where: { closedAt: null },
    orderBy: { openedAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  let expected = current?.openingFloat ?? 0;
  if (current) {
    const cashSales = await prisma.sale.aggregate({
      where: { cashSessionId: current.id, paymentMethod: "CASH", status: "COMPLETED" },
      _sum: { total: true },
      _count: true,
    });
    expected = current.openingFloat + (cashSales._sum.total ?? 0);
  }

  const history = await prisma.cashSession.findMany({
    where: { closedAt: { not: null } },
    orderBy: { closedAt: "desc" },
    take: 10,
    include: { user: { select: { name: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Caisse"
        description="Ouverture / clôture de session, suivi des espèces"
      />

      {/* Session courante */}
      <Card className="mb-6 p-6">
        {current ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-[#22C55E20] text-[#22C55E]">
                  <Banknote size={28} />
                </div>
                <div>
                  <h2 className="t-h3">Session ouverte</h2>
                  <p className="t-muted text-sm">
                    Depuis {fmtDateTime(current.openedAt)} par {current.user.name}
                  </p>
                </div>
              </div>
              <Badge variant="success" dot>En cours</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Stat label="Fond initial" value={fmtMoney(current.openingFloat)} mono />
              <Stat label="Montant théorique" value={fmtMoney(expected)} mono accent />
              <Stat label="Durée" value={timeSince(current.openedAt)} icon={Clock} />
            </div>
            {current.notes ? (
              <p className="mt-3 text-sm text-muted-foreground">Notes : {current.notes}</p>
            ) : null}
            <div className="mt-5">
              <CloseSessionDialog
                sessionId={current.id}
                expectedAmount={expected}
                trigger={
                  <Button variant="destructive" size="lg">
                    <Lock size={16} /> Clôturer la session
                  </Button>
                }
              />
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-xl bg-muted text-muted-foreground">
              <Banknote size={28} />
            </div>
            <h2 className="t-h3 mb-2">Aucune session ouverte</h2>
            <p className="t-muted mb-5">Ouvrez une session pour commencer à enregistrer des ventes au comptant.</p>
            <OpenSessionDialog
              trigger={
                <Button size="lg">
                  <Banknote size={16} /> Ouvrir une session
                </Button>
              }
            />
          </div>
        )}
      </Card>

      {/* Historique */}
      <Card>
        <div className="border-b p-5">
          <h3 className="t-h4 m-0">Sessions précédentes</h3>
          <p className="t-muted text-sm">10 dernières sessions clôturées</p>
        </div>
        {history.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Aucune session clôturée.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <Th>Caissier</Th>
                <Th>Ouverture</Th>
                <Th>Clôture</Th>
                <Th align="right">Théorique</Th>
                <Th align="right">Compté</Th>
                <Th align="right">Écart</Th>
              </tr>
            </thead>
            <tbody>
              {history.map((s) => (
                <tr key={s.id} className="border-t last:border-b-0">
                  <td className="px-4 py-3">{s.user.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDateTime(s.openedAt)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {s.closedAt ? fmtDateTime(s.closedAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{fmtMoney(s.expectedAmount)}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {s.countedAmount !== null ? fmtMoney(s.countedAmount) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.discrepancy !== null ? (
                      <Badge
                        variant={
                          s.discrepancy === 0 ? "success" :
                          Math.abs(s.discrepancy) <= 500 ? "warning" : "destructive"
                        }
                        className="font-mono"
                      >
                        {s.discrepancy > 0 ? "−" : s.discrepancy < 0 ? "+" : ""}{fmtMoney(Math.abs(s.discrepancy))}
                      </Badge>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  mono,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
  icon?: typeof Clock;
}) {
  return (
    <div className="rounded-md border bg-muted/40 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={`mt-1 flex items-center gap-1.5 text-xl font-bold ${mono ? "font-mono" : ""}`}
        style={accent ? { color: "#0EA5E9" } : undefined}
      >
        {Icon ? <Icon size={16} className="text-muted-foreground" /> : null}
        {value}
      </div>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <th
      className={`px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function timeSince(date: Date): string {
  const ms = Date.now() - date.getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}
