import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit, Pill } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MedImage } from "@/components/charts/med-image";
import { MedicineFormDialog } from "@/components/medicaments/medicine-form-dialog";
import { PageHeader } from "@/components/common/page-header";
import { canSeePurchasePrice } from "@/lib/permissions";
import { fmtMoney, fmtDate } from "@/lib/utils";

interface PageProps {
  params: { locale: string; id: string };
}

// PHARMASOFT — Fiche détaillée d'un médicament.
export default async function MedicineDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) return null;
  const seePurchase = canSeePurchasePrice(session.user.role);

  const medicine = await prisma.medicine.findUnique({
    where: { id: params.id },
    include: {
      lots: {
        where: { quantity: { gt: 0 } },
        include: { supplier: { select: { name: true } } },
        orderBy: { expiryDate: "asc" },
      },
      _count: { select: { saleLines: true } },
    },
  });

  if (!medicine || medicine.deletedAt) notFound();

  const stock = medicine.lots.reduce((s, l) => s + l.quantity, 0);
  const status: "ok" | "low" | "out" = stock === 0 ? "out" : stock <= medicine.lowStockThreshold ? "low" : "ok";

  return (
    <div>
      <Link
        href={`/${params.locale}/medicaments`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> Tous les médicaments
      </Link>

      <PageHeader
        title={medicine.name}
        description={`${medicine.dci} · ${medicine.laboratory} · ${medicine.code}`}
        actions={
          session.user.role === "TITULAIRE" ? (
            <MedicineFormDialog
              mode="edit"
              initial={{
                id: medicine.id,
                code: medicine.code,
                barcode: medicine.barcode,
                name: medicine.name,
                dci: medicine.dci,
                form: medicine.form,
                dosage: medicine.dosage,
                laboratory: medicine.laboratory,
                category: medicine.category,
                sellPrice: medicine.sellPrice,
                purchasePrice: medicine.purchasePrice,
                requiresPrescription: medicine.requiresPrescription,
                controlledSubstance: medicine.controlledSubstance,
                lowStockThreshold: medicine.lowStockThreshold,
                description: medicine.description,
              }}
              canSeePurchase={seePurchase}
              trigger={
                <Button variant="outline">
                  <Edit size={14} /> Modifier
                </Button>
              }
            />
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        {/* Card profil */}
        <Card className="p-6">
          <div className="mb-4 flex items-start gap-3">
            <MedImage name={medicine.name} size={64} radius={12} />
            <div>
              <h3 className="t-h3">{medicine.name}</h3>
              <p className="t-muted text-sm">{medicine.dci}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="neutral" className="text-[10px]">
                  {medicine.form.replaceAll("_", " ").toLowerCase()}
                </Badge>
                <Badge variant="neutral" className="text-[10px]">
                  {medicine.dosage}
                </Badge>
                {medicine.requiresPrescription ? (
                  <Badge variant="warning" className="text-[10px]">
                    Rx
                  </Badge>
                ) : null}
                {medicine.controlledSubstance ? (
                  <Badge variant="destructive" className="text-[10px]">
                    Contrôlée
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <Row label="Catégorie" value={medicine.category.replaceAll("_", " ").toLowerCase()} />
            <Row label="Code interne" value={<span className="font-mono">{medicine.code}</span>} />
            <Row label="Code-barres" value={<span className="font-mono">{medicine.barcode ?? "—"}</span>} />
            <Row label="Prix de vente" value={<span className="font-mono font-semibold">{fmtMoney(medicine.sellPrice)}</span>} />
            {seePurchase ? (
              <Row
                label="Prix d'achat"
                value={<span className="font-mono text-muted-foreground">{fmtMoney(medicine.purchasePrice)}</span>}
              />
            ) : null}
            {seePurchase && medicine.sellPrice > 0 && medicine.purchasePrice > 0 ? (
              <Row
                label="Marge"
                value={
                  <span className="font-mono text-[#22C55E]">
                    {Math.round(((medicine.sellPrice - medicine.purchasePrice) / medicine.sellPrice) * 100)}%
                  </span>
                }
              />
            ) : null}
            <Row label="Seuil bas" value={`${medicine.lowStockThreshold} u.`} />
          </div>
        </Card>

        {/* Card stock + lots */}
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex items-baseline justify-between">
              <div>
                <h4 className="t-h4 m-0">Stock total</h4>
                <p className="t-muted text-sm">{medicine.lots.length} lot{medicine.lots.length > 1 ? "s" : ""} disponible{medicine.lots.length > 1 ? "s" : ""}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold tabular-nums">{stock}</div>
                <Badge variant={status === "out" ? "destructive" : status === "low" ? "warning" : "success"}>
                  {status === "out" ? "Rupture" : status === "low" ? "Stock bas" : "OK"}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-0">
            <div className="border-b p-5">
              <h4 className="t-h4 m-0">Lots en stock</h4>
              <p className="t-muted text-sm">Triés par péremption (FIFO).</p>
            </div>
            {medicine.lots.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Aucun lot disponible. <span className="font-medium text-foreground">À recommander.</span>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <Th>N° Lot</Th>
                    <Th>Quantité</Th>
                    <Th>Péremption</Th>
                    <Th>Fournisseur</Th>
                    {seePurchase ? <Th>Prix achat</Th> : null}
                  </tr>
                </thead>
                <tbody>
                  {medicine.lots.map((lot) => {
                    const daysToExpiry = Math.floor(
                      (lot.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                    );
                    const expiryTone =
                      daysToExpiry <= 30 ? "destructive" : daysToExpiry <= 90 ? "warning" : "neutral";
                    return (
                      <tr key={lot.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-mono text-xs">{lot.lotNumber}</td>
                        <td className="px-4 py-3 font-mono">{lot.quantity}</td>
                        <td className="px-4 py-3">
                          <Badge variant={expiryTone} className="text-[10px]">
                            {fmtDate(lot.expiryDate)} ({daysToExpiry}j)
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{lot.supplier?.name ?? "—"}</td>
                        {seePurchase ? (
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {fmtMoney(lot.purchasePrice)}
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>

          {medicine.description ? (
            <Card className="p-5">
              <h4 className="t-h4 mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{medicine.description}</p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  );
}
