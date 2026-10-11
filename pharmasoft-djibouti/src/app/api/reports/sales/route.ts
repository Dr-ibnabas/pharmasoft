import { prisma } from "@/lib/prisma";
import { handleApiError, requireResource, ApiError } from "@/lib/api-helpers";
import { buildWorkbook, xlsxHeaders } from "@/lib/excel/export";

export const runtime = "nodejs";

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Espèces", CARD: "Carte", DMONEY: "D-Money",
  WAAFI: "Waafi", INSURANCE: "Assurance", CREDIT: "Crédit",
};

// GET /api/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD — Export Excel
export async function GET(req: Request) {
  try {
    const session = await requireResource("reports");
    if (session.user.role !== "TITULAIRE") {
      throw new ApiError(403, "Accès réservé au Pharmacien titulaire");
    }

    const url = new URL(req.url);
    const from = url.searchParams.get("from")
      ? new Date(url.searchParams.get("from")!)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = url.searchParams.get("to")
      ? new Date(url.searchParams.get("to")! + "T23:59:59")
      : new Date();

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: from, lte: to }, status: "COMPLETED" },
      include: {
        client: { select: { name: true } },
        user: { select: { name: true } },
        lines: { include: { medicine: { select: { name: true } } } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Feuille 1 : ventes (1 ligne par vente)
    const ventesRows = sales.map((s) => ({
      "Date": s.createdAt.toLocaleString("fr-FR"),
      "Ticket": s.ticketNumber,
      "Vendeur": s.user.name,
      "Client": s.client?.name ?? "(occasionnel)",
      "Sous-total (Fdj)": s.subtotal,
      "Remise (Fdj)": s.discountAmount,
      "TVA (Fdj)": s.taxAmount,
      "Total (Fdj)": s.total,
      "Mode paiement": PAYMENT_LABEL[s.paymentMethod] ?? s.paymentMethod,
      "Lignes": s.lines.length,
    }));

    // Feuille 2 : lignes détaillées (1 ligne par item)
    const lignesRows = sales.flatMap((s) =>
      s.lines.map((l) => ({
        "Date": s.createdAt.toLocaleString("fr-FR"),
        "Ticket": s.ticketNumber,
        "Médicament": l.medicine.name,
        "Quantité": l.quantity,
        "PU (Fdj)": l.unitPrice,
        "Total ligne (Fdj)": l.lineTotal,
      })),
    );

    const buf = buildWorkbook([
      { name: "Ventes", rows: ventesRows, colWidths: [20, 12, 22, 22, 14, 12, 12, 14, 14, 8] },
      { name: "Lignes détaillées", rows: lignesRows, colWidths: [20, 12, 32, 10, 14, 14] },
    ]);

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "REPORT_VIEW",
        resource: "SalesExport",
        details: { from: from.toISOString(), to: to.toISOString(), count: sales.length },
      },
    });

    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);
    return new Response(new Uint8Array(buf), { headers: xlsxHeaders(`ventes-${fromStr}-${toStr}.xlsx`) });
  } catch (e) {
    return handleApiError(e);
  }
}
