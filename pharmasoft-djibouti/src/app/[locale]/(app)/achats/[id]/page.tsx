import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageCheck, Truck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { ReceiveDialog } from "@/components/achats/receive-dialog";
import { SendCancelButtons } from "@/components/achats/send-cancel-buttons";
import { fmtMoney, fmtDate } from "@/lib/utils";

const STATUS_META: Record<string, { variant: "neutral" | "primary" | "warning" | "success" | "destructive"; label: string }> = {
  DRAFT: { variant: "neutral", label: "Brouillon" },
  SENT: { variant: "primary", label: "Envoyée" },
  PARTIAL_RECEIVED: { variant: "warning", label: "Partiellement reçue" },
  RECEIVED: { variant: "success", label: "Réceptionnée" },
  CANCELLED: { variant: "destructive", label: "Annulée" },
};

export default async function PurchaseOrderDetailPage({ params }: { params: { locale: string; id: string } }) {
  const session = await auth();
  if (!session?.user) return null;

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: params.id },
    include: {
      supplier: true,
      createdBy: { select: { name: true } },
      items: { include: { medicine: { select: { name: true, code: true } } } },
    },
  });
  if (!po) notFound();

  const meta = STATUS_META[po.status] ?? STATUS_META["DRAFT"]!;
  const canReceive = po.status === "SENT" || po.status === "PARTIAL_RECEIVED" || po.status === "DRAFT";
  const canEdit = po.status === "DRAFT";

  return (
    <div>
      <Link href={`/${params.locale}/achats`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Toutes les commandes
      </Link>

      <PageHeader
        title={<span className="font-mono">{po.code}</span>}
        description={`${po.supplier.name} · créée le ${fmtDate(po.orderedAt)} par ${po.createdBy.name}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={meta.variant}>{meta.label}</Badge>
            {canEdit ? <SendCancelButtons poId={po.id} /> : null}
            {canReceive ? (
              <ReceiveDialog
                poId={po.id}
                poCode={po.code}
                items={po.items.map((i) => ({
                  id: i.id,
                  medicineName: i.medicine.name,
                  ordered: i.quantity,
                  alreadyReceived: i.receivedQty,
                }))}
                trigger={<Button><PackageCheck size={14} /> Réceptionner</Button>}
              />
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="p-0">
          <div className="border-b p-4">
            <h3 className="t-h4 m-0">Lignes de commande</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Produit</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Commandé</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Reçu</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">PA unit.</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map((i) => (
                <tr key={i.id} className="border-t last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{i.medicine.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{i.medicine.code}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{i.quantity}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={i.receivedQty >= i.quantity ? "success" : i.receivedQty > 0 ? "warning" : "neutral"}>
                      {i.receivedQty}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmtMoney(i.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-mono">{fmtMoney(i.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h3 className="t-h4 mb-3 flex items-center gap-2">
              <Truck size={16} className="text-muted-foreground" /> Fournisseur
            </h3>
            <div className="font-semibold">{po.supplier.name}</div>
            <div className="mt-1 space-y-1 text-sm text-muted-foreground">
              {po.supplier.contact ? <div>{po.supplier.contact}</div> : null}
              <div>{po.supplier.phone}</div>
              {po.supplier.email ? <div>{po.supplier.email}</div> : null}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="t-h4 mb-3">Récapitulatif</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total HT</span><span className="font-mono">{fmtMoney(po.subtotal)}</span></div>
              <div className="flex justify-between border-t pt-1.5 font-semibold"><span>Total</span><span className="font-mono">{fmtMoney(po.total)}</span></div>
              {po.expectedAt ? (
                <div className="flex justify-between pt-1.5 text-xs text-muted-foreground"><span>Livraison attendue</span><span>{fmtDate(po.expectedAt)}</span></div>
              ) : null}
              {po.receivedAt ? (
                <div className="flex justify-between text-xs text-muted-foreground"><span>Réceptionnée le</span><span>{fmtDate(po.receivedAt)}</span></div>
              ) : null}
            </div>
          </Card>

          {po.notes ? (
            <Card className="p-5">
              <h3 className="t-h4 mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground">{po.notes}</p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
