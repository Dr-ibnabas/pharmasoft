import { prisma } from "@/lib/prisma";
import {
  jsonOk,
  handleApiError,
  parseBody,
  requireResource,
  ApiError,
} from "@/lib/api-helpers";
import { cashCloseSchema } from "@/lib/validations/cash";

// POST /api/cash-sessions/[id]/close — Clôture la session.
// Calcule l'écart = expectedAmount - countedAmount.
export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireResource("caisse");
    const data = await parseBody(req, cashCloseSchema);

    const cs = await prisma.cashSession.findUnique({ where: { id: ctx.params.id } });
    if (!cs) throw new ApiError(404, "Session introuvable");
    if (cs.closedAt) throw new ApiError(400, "Session déjà clôturée");

    // Recalcule expectedAmount au moment de la clôture
    const cashSales = await prisma.sale.aggregate({
      where: { cashSessionId: cs.id, paymentMethod: "CASH", status: "COMPLETED" },
      _sum: { total: true },
    });
    const expected = cs.openingFloat + (cashSales._sum.total ?? 0);
    const discrepancy = expected - data.countedAmount;

    const closed = await prisma.cashSession.update({
      where: { id: cs.id },
      data: {
        closedAt: new Date(),
        expectedAmount: expected,
        countedAmount: data.countedAmount,
        discrepancy,
        notes: data.notes ?? cs.notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        resource: "CashSession",
        resourceId: cs.id,
        details: { closed: true, expected, counted: data.countedAmount, discrepancy },
      },
    });

    return jsonOk(closed);
  } catch (e) {
    return handleApiError(e);
  }
}
