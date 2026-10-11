import { prisma } from "@/lib/prisma";
import { handleApiError, requireResource, ApiError } from "@/lib/api-helpers";
import { renderPdfBuffer, pdfHeaders } from "@/lib/pdf/render";
import { InsuranceBatchDocument } from "@/lib/pdf/templates/insurance-batch";

export const runtime = "nodejs";

// GET /api/reports/insurance/[id]?from=...&to=...
// PDF du bordereau mensuel pour un assureur.
export async function GET(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireResource("reports");
    if (session.user.role !== "TITULAIRE") {
      throw new ApiError(403, "Accès réservé au Pharmacien titulaire");
    }

    const url = new URL(req.url);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const from = url.searchParams.get("from") ? new Date(url.searchParams.get("from")!) : monthStart;
    const to = url.searchParams.get("to") ? new Date(url.searchParams.get("to")! + "T23:59:59") : monthEnd;

    const [insurance, pharmacy, claims] = await Promise.all([
      prisma.insurance.findUnique({ where: { id: ctx.params.id } }),
      prisma.setting.findFirst(),
      prisma.insuranceClaim.findMany({
        where: {
          insuranceId: ctx.params.id,
          createdAt: { gte: from, lte: to },
        },
        include: {
          sale: {
            select: {
              ticketNumber: true,
              createdAt: true,
              total: true,
              client: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    if (!insurance) throw new ApiError(404, "Assureur introuvable");

    // Récupère le memberNumber via InsuranceMember
    const clientIds = claims.map((c) => c.sale.client).filter(Boolean).map((c) => c?.name ?? "");
    const members = await prisma.insuranceMember.findMany({
      where: { insuranceId: ctx.params.id, client: { name: { in: clientIds } } },
      include: { client: { select: { name: true } } },
    });
    const memberByName = new Map(members.map((m) => [m.client.name, m.memberNumber]));

    const data = {
      pharmacy: pharmacy
        ? { name: pharmacy.pharmacyName, address: pharmacy.address, city: pharmacy.city, nif: pharmacy.nif }
        : { name: "Pharmacie", address: "", city: "", nif: "" },
      insurance: {
        name: insurance.name,
        coverageRate: insurance.coverageRate,
        address: insurance.address,
      },
      periodStart: from,
      periodEnd: to,
      claims: claims
        .filter((c) => c.sale.client)
        .map((c) => ({
          id: c.id,
          saleDate: c.sale.createdAt,
          ticketNumber: c.sale.ticketNumber,
          clientName: c.sale.client!.name,
          memberNumber: memberByName.get(c.sale.client!.name) ?? "—",
          saleTotal: c.sale.total,
          amountClaimed: c.amountClaimed,
        })),
    };

    const buf = await renderPdfBuffer(InsuranceBatchDocument({ data }));

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "REPORT_VIEW",
        resource: "InsuranceBatch",
        resourceId: insurance.id,
        details: { count: claims.length, period: `${from.toISOString().slice(0, 10)}_${to.toISOString().slice(0, 10)}` },
      },
    });

    const slug = insurance.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return new Response(new Uint8Array(buf), { headers: pdfHeaders(`bordereau-${slug}-${from.toISOString().slice(0, 7)}.pdf`) });
  } catch (e) {
    return handleApiError(e);
  }
}
