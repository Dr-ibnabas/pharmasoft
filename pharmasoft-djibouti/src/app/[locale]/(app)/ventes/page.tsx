import Link from "next/link";
import { Receipt, Undo2, ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { RefundDialog } from "@/components/ventes/refund-dialog";
import { fmtMoney, fmtDateTime } from "@/lib/utils";

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Espèces", CARD: "Carte", DMONEY: "D-Money",
  WAAFI: "Waafi", INSURANCE: "Assurance", CREDIT: "Crédit", MIXED: "Mixte",
};

const STATUS_META: Record<string, { variant: "success" | "neutral" | "destructive"; label: string }> = {
  COMPLETED: { variant: "success", label: "Encaissée" },
  REFUNDED: { variant: "destructive", label: "Remboursée" },
  CANCELLED: { variant: "neutral", label: "Annulée" },
  ON_HOLD: { variant: "neutral", label: "En attente" },
};

export default async function VentesPage({ params }: { params: { locale: string } }) {
  const session = await auth();
  if (!session?.user) return null;

  // Le titulaire voit tout ; vendeur/caissier voient leurs propres ventes
  const isTitulaire = session.user.role === "TITULAIRE";
  const where = isTitulaire ? {} : { userId: session.user.id };

  const sales = await prisma.sale.findMany({
    where,
    include: {
      client: { select: { name: true } },
      user: { select: { name: true } },
      lines: { include: { medicine: { select: { name: true } } } },
      refunds: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Ventes"
        description={isTitulaire ? "Historique complet des ventes" : "Vos ventes récentes"}
      />

      {sales.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          <Receipt size={32} className="mx-auto mb-3 text-muted-foreground/50" />
          Aucune vente enregistrée.
        </Card>
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <Th>Ticket</Th>
                <Th>Date</Th>
                <Th>Client</Th>
                {isTitulaire ? <Th>Vendeur</Th> : null}
                <Th>Paiement</Th>
                <Th align="right">Total</Th>
                <Th>Statut</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const meta = STATUS_META[s.status] ?? STATUS_META["COMPLETED"]!;
                const canRefund = s.status === "COMPLETED";
                return (
                  <tr key={s.id} className="border-t last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{s.ticketNumber}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDateTime(s.createdAt)}</td>
                    <td className="px-4 py-3">{s.client?.name ?? <span className="text-muted-foreground">Occasionnel</span>}</td>
                    {isTitulaire ? <td className="px-4 py-3 text-muted-foreground">{s.user.name}</td> : null}
                    <td className="px-4 py-3">
                      <Badge variant="neutral" className="text-[10px]">{PAYMENT_LABEL[s.paymentMethod] ?? s.paymentMethod}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">{fmtMoney(s.total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                      {s.refunds.length > 0 && s.status !== "REFUNDED" ? (
                        <Badge variant="warning" className="ml-1 text-[10px]">retour partiel</Badge>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {canRefund ? (
                          <RefundDialog
                            saleId={s.id}
                            ticketNumber={s.ticketNumber}
                            lines={s.lines.map((l) => ({ id: l.id, name: l.medicine.name, quantity: l.quantity, unitPrice: l.unitPrice }))}
                            trigger={
                              <Button variant="ghost" size="sm"><Undo2 size={13} /> Retour</Button>
                            }
                          />
                        ) : null}
                        <Link href={`/${params.locale}/ticket/${s.id}`} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function Th({ children, align }: { children?: React.ReactNode; align?: "right" }) {
  return (
    <th className={`px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}
