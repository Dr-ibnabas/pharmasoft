import { prisma } from "@/lib/prisma";
import {
  jsonOk,
  handleApiError,
  parseBody,
  requireResource,
  ApiError,
} from "@/lib/api-helpers";
import { cashOpenSchema } from "@/lib/validations/cash";

// POST /api/cash-sessions/open — Ouvre une nouvelle session.
// Une seule session ouverte à la fois (single-tenant).
export async function POST(req: Request) {
  try {
    const session = await requireResource("caisse");
    const data = await parseBody(req, cashOpenSchema);

    const existing = await prisma.cashSession.findFirst({ where: { closedAt: null } });
    if (existing) {
      throw new ApiError(400, "Une session de caisse est déjà ouverte. Clôturez-la d'abord.");
    }

    const created = await prisma.cashSession.create({
      data: {
        userId: session.user.id,
        openingFloat: data.openingFloat,
        notes: data.notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        resource: "CashSession",
        resourceId: created.id,
        details: { openingFloat: data.openingFloat },
      },
    });

    return jsonOk(created, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
