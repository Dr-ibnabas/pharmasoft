import Link from "next/link";
import { Plus, ShoppingBag, ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { NewPurchaseOrderDialog } from "@/components/achats/new-po-dialog";
import { fmtMoney, fmtDate } from "@/lib/utils";

const STATUS_META: Record<string, { variant: "neutral" | "primary" | "warning" | "success" | "destructive"; label: string }> = {
  DRAFT: { variant: "neutral", label: "Brouillon" },
  SENT: { variant: "primary", label: "Envoyée" },
  PARTIAL_RECEIVED: { variant: "warning", label: "Partielle" },
  RECEIVED: { variant: "success", label: "Réceptionnée" },
  CANCELLED: { variant: "destructive", label: "Annulée" },
};

export default async function AchatsPage({ params }: { params: { locale: string } }) {
  const session = await auth();
  if (!session?.user) return null;

  const [orders, suppliers, medicines] = await Promise.all([
    prisma.purchaseOrder.findMany({
      include: { supplier: { select: { name: true } }, _count: { select: { items: true } } },
      orderBy: { orderedAt: "desc" },
      take: 100,
    }),
    prisma.supplier.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.medicine.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, code: true, purchasePrice: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Achats"
        description={`${orders.length} bons de commande`}
        actions={
          <NewPurchaseOrderDialog
            suppliers={suppliers}
            medicines={medicines}
            trigger={<Button><Plus size={14} /> Nouvelle commande</Button>}
          />
        }
      />

      {orders.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          <ShoppingBag size={32} className="mx-auto mb-3 text-muted-foreground/50" />
          Aucune commande. Créez votre premier bon de commande pour réceptionner du stock.
        </Card>
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <Th>Code</Th>
                <Th>Fournisseur</Th>
                <Th>Lignes</Th>
                <Th>Date</Th>
                <Th align="right">Total</Th>
                <Th>Statut</Th>
                <Th align="right" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const meta = STATUS_META[o.status] ?? STATUS_META["DRAFT"]!;
                return (
                  <tr key={o.id} className="border-t last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs">{o.code}</td>
                    <td className="px-4 py-3">{o.supplier.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o._count.items}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(o.orderedAt)}</td>
                    <td className="px-4 py-3 text-right font-mono">{fmtMoney(o.total)}</td>
                    <td className="px-4 py-3"><Badge variant={meta.variant}>{meta.label}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/${params.locale}/achats/${o.id}`}
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <ExternalLink size={14} />
                      </Link>
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
