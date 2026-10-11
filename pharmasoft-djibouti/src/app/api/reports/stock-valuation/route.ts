import { prisma } from "@/lib/prisma";
import { handleApiError, requireResource, ApiError } from "@/lib/api-helpers";
import { buildWorkbook, xlsxHeaders } from "@/lib/excel/export";

export const runtime = "nodejs";

// GET /api/reports/stock-valuation — Excel : valorisation du stock par produit + lot.
// Réservé TITULAIRE car contient les prix d'achat (D-013).
export async function GET() {
  try {
    const session = await requireResource("reports");
    if (session.user.role !== "TITULAIRE") {
      throw new ApiError(403, "Accès réservé au Pharmacien titulaire");
    }

    const medicines = await prisma.medicine.findMany({
      where: { deletedAt: null },
      include: { lots: { where: { quantity: { gt: 0 } } } },
      orderBy: { name: "asc" },
    });

    const productRows = medicines.map((m) => {
      const stock = m.lots.reduce((s, l) => s + l.quantity, 0);
      const valuePurchase = m.lots.reduce((s, l) => s + l.quantity * l.purchasePrice, 0);
      const valueSell = stock * m.sellPrice;
      const margin = valueSell - valuePurchase;
      return {
        "Code": m.code,
        "Médicament": m.name,
        "DCI": m.dci,
        "Catégorie": m.category,
        "Stock": stock,
        "PV unitaire (Fdj)": m.sellPrice,
        "Valeur PA (Fdj)": valuePurchase,
        "Valeur PV (Fdj)": valueSell,
        "Marge brute (Fdj)": margin,
        "Marge %": valueSell > 0 ? Math.round((margin / valueSell) * 100) : 0,
        "Nb lots": m.lots.length,
      };
    });

    const lotRows = medicines.flatMap((m) =>
      m.lots.map((l) => ({
        "Médicament": m.name,
        "Lot": l.lotNumber,
        "Quantité": l.quantity,
        "Péremption": l.expiryDate.toISOString().slice(0, 10),
        "PA unitaire (Fdj)": l.purchasePrice,
        "Valeur lot (Fdj)": l.quantity * l.purchasePrice,
      })),
    );

    const buf = buildWorkbook([
      { name: "Valorisation produit", rows: productRows, colWidths: [10, 30, 22, 18, 8, 14, 14, 14, 14, 10, 8] },
      { name: "Détail lots", rows: lotRows, colWidths: [30, 18, 10, 14, 14, 14] },
    ]);

    await prisma.auditLog.create({
      data: { userId: session.user.id, action: "REPORT_VIEW", resource: "StockValuation" },
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    return new Response(new Uint8Array(buf), { headers: xlsxHeaders(`stock-valorisation-${dateStr}.xlsx`) });
  } catch (e) {
    return handleApiError(e);
  }
}
