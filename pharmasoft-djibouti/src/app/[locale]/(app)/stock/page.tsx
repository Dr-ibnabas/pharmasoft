import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExternalLink, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { MedImage } from "@/components/charts/med-image";
import { StockAdjustDialog } from "@/components/stock/adjust-dialog";
import { canSeePurchasePrice } from "@/lib/permissions";
import { fmtDate, fmtMoney } from "@/lib/utils";

interface SearchParams {
  q?: string;
  filter?: "all" | "low" | "expiring";
}

// PHARMASOFT — Vue stock & lots.
// Liste les médicaments avec leur stock total + un détail de leurs lots actifs.
export default async function StockPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) return null;
  const role = session.user.role;
  const seePurchase = canSeePurchasePrice(role);
  const canAdjust = role === "TITULAIRE";
  const filter = searchParams.filter ?? "all";
  const q = searchParams.q?.toLowerCase() ?? "";
  const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const medicines = await prisma.medicine.findMany({
    where: {
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { dci: { contains: q, mode: "insensitive" } },
              { code: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      lots: {
        include: { supplier: { select: { name: true } } },
        orderBy: { expiryDate: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  type Row = (typeof medicines)[number] & { stock: number; status: "ok" | "low" | "out"; hasExpiring: boolean };

  const rows: Row[] = medicines.map((m) => {
    const stock = m.lots.reduce((s, l) => s + l.quantity, 0);
    const status: Row["status"] = stock === 0 ? "out" : stock <= m.lowStockThreshold ? "low" : "ok";
    const hasExpiring = m.lots.some((l) => l.quantity > 0 && l.expiryDate < in30);
    return { ...m, stock, status, hasExpiring };
  });

  const filtered = rows.filter((r) => {
    if (filter === "low") return r.status === "low" || r.status === "out";
    if (filter === "expiring") return r.hasExpiring;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Stock & lots"
        description="Quantités actuelles par médicament et détail des lots (FIFO)"
        actions={
          <div className="flex gap-1.5">
            <FilterPill href={`/${params.locale}/stock`} active={filter === "all"}>
              Tout ({rows.length})
            </FilterPill>
            <FilterPill href={`/${params.locale}/stock?filter=low`} active={filter === "low"}>
              Stock bas
            </FilterPill>
            <FilterPill href={`/${params.locale}/stock?filter=expiring`} active={filter === "expiring"}>
              Péremption ≤ 30j
            </FilterPill>
          </div>
        }
      />

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center text-sm text-muted-foreground">
            Aucun médicament ne correspond aux filtres.
          </Card>
        ) : (
          filtered.map((m) => (
            <Card key={m.id} className="overflow-hidden p-0">
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <MedImage name={m.name} size={44} radius={10} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${params.locale}/medicaments/${m.id}`}
                        className="truncate font-semibold hover:underline"
                      >
                        {m.name}
                      </Link>
                      {m.requiresPrescription ? (
                        <Badge variant="warning" className="text-[10px]">Rx</Badge>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.dci} · {m.laboratory} · {m.code}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Stock total</div>
                    <div className="font-mono text-xl font-bold">{m.stock}</div>
                  </div>
                  <Badge variant={m.status === "out" ? "destructive" : m.status === "low" ? "warning" : "success"}>
                    {m.status === "out" ? "Rupture" : m.status === "low" ? "Bas" : "OK"}
                  </Badge>
                  <Link
                    href={`/${params.locale}/medicaments/${m.id}`}
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>

              {/* Lot detail */}
              {m.lots.length > 0 ? (
                <div className="border-t bg-muted/30 px-4 py-2.5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="py-1.5 text-left font-medium">Lot</th>
                        <th className="py-1.5 text-left font-medium">Qté</th>
                        <th className="py-1.5 text-left font-medium">Péremption</th>
                        <th className="py-1.5 text-left font-medium">Fournisseur</th>
                        {seePurchase ? <th className="py-1.5 text-left font-medium">Prix achat</th> : null}
                        {canAdjust ? <th className="py-1.5 text-right font-medium">Actions</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {m.lots.map((lot) => {
                        const daysToExpiry = Math.floor(
                          (lot.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                        );
                        const expiryTone =
                          daysToExpiry <= 30 ? "destructive" : daysToExpiry <= 90 ? "warning" : "neutral";
                        return (
                          <tr key={lot.id} className="border-t last:border-b-0">
                            <td className="py-2 font-mono text-xs">{lot.lotNumber}</td>
                            <td className="py-2 font-mono">{lot.quantity}</td>
                            <td className="py-2">
                              <Badge variant={expiryTone} className="text-[10px]">
                                {fmtDate(lot.expiryDate)} ({daysToExpiry}j)
                              </Badge>
                            </td>
                            <td className="py-2 text-xs text-muted-foreground">
                              {lot.supplier?.name ?? "—"}
                            </td>
                            {seePurchase ? (
                              <td className="py-2 font-mono text-xs text-muted-foreground">
                                {fmtMoney(lot.purchasePrice)}
                              </td>
                            ) : null}
                            {canAdjust ? (
                              <td className="py-2 text-right">
                                <StockAdjustDialog
                                  lotId={lot.id}
                                  lotNumber={lot.lotNumber}
                                  currentQuantity={lot.quantity}
                                  medicineName={m.name}
                                  trigger={
                                    <Button variant="ghost" size="sm">
                                      <Wrench size={13} /> Ajuster
                                    </Button>
                                  }
                                />
                              </td>
                            ) : null}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 items-center rounded-full border px-3 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  );
}
