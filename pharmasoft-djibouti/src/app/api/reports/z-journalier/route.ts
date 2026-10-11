import { prisma } from "@/lib/prisma";
import { handleApiError, requireResource, ApiError } from "@/lib/api-helpers";
import { renderPdfBuffer, pdfHeaders } from "@/lib/pdf/render";
import { ZJournalierDocument } from "@/lib/pdf/templates/z-journalier";

export const runtime = "nodejs";

// GET /api/reports/z-journalier?sessionId=...&date=YYYY-MM-DD
// Génère le Z journalier pour une session de caisse (open ou fermée).
export async function GET(req: Request) {
  try {
    const session = await requireResource("reports");
    if (session.user.role !== "TITULAIRE") {
      throw new ApiError(403, "Accès réservé au Pharmacien titulaire");
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");

    const cashSession = sessionId
      ? await prisma.cashSession.findUnique({
          where: { id: sessionId },
          include: { user: { select: { name: true } } },
        })
      : await prisma.cashSession.findFirst({
          orderBy: { openedAt: "desc" },
          include: { user: { select: { name: true } } },
        });

    if (!cashSession) throw new ApiError(404, "Aucune session de caisse trouvée");

    const [pharmacy, sales] = await Promise.all([
      prisma.setting.findFirst(),
      prisma.sale.findMany({
        where: { cashSessionId: cashSession.id, status: "COMPLETED" },
        select: { paymentMethod: true, total: true },
      }),
    ]);

    const breakdownMap = new Map<string, { count: number; total: number }>();
    for (const s of sales) {
      const prev = breakdownMap.get(s.paymentMethod) ?? { count: 0, total: 0 };
      prev.count += 1;
      prev.total += s.total;
      breakdownMap.set(s.paymentMethod, prev);
    }
    const breakdown = Array.from(breakdownMap.entries()).map(([method, v]) => ({
      method,
      count: v.count,
      total: v.total,
    }));

    const totalRevenue = sales.reduce((s, x) => s + x.total, 0);

    const cashSales = sales.filter((s) => s.paymentMethod === "CASH").reduce((s, x) => s + x.total, 0);
    const expected = cashSession.expectedAmount || cashSession.openingFloat + cashSales;

    const buf = await renderPdfBuffer(
      ZJournalierDocument({
        data: {
          pharmacy: pharmacy
            ? { name: pharmacy.pharmacyName, address: pharmacy.address, city: pharmacy.city, nif: pharmacy.nif }
            : { name: "Pharmacie", address: "", city: "", nif: "" },
          date: cashSession.openedAt,
          cashier: cashSession.user.name,
          openingFloat: cashSession.openingFloat,
          closedAt: cashSession.closedAt,
          expectedAmount: expected,
          countedAmount: cashSession.countedAmount,
          discrepancy: cashSession.discrepancy,
          paymentBreakdown: breakdown,
          saleCount: sales.length,
          totalRevenue,
        },
      }),
    );

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "REPORT_VIEW",
        resource: "ZJournalier",
        resourceId: cashSession.id,
      },
    });

    const dateStr = cashSession.openedAt.toISOString().slice(0, 10);
    return new Response(new Uint8Array(buf), { headers: pdfHeaders(`z-journalier-${dateStr}.pdf`) });
  } catch (e) {
    return handleApiError(e);
  }
}
