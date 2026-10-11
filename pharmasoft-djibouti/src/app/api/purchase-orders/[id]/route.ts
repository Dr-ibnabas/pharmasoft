import { prisma } from "@/lib/prisma";
import { jsonOk, handleApiError, requireResource, ApiError } from "@/lib/api-helpers";

// GET /api/purchase-orders/[id] — détail
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    await requireResource("purchases");
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: ctx.params.id },
      include: {
        supplier: true,
        createdBy: { select: { name: true } },
        items: { include: { medicine: { select: { name: true, code: true, form: true, dosage: true } } } },
      },
    });
    if (!po) throw new ApiError(404, "Commande introuvable");
    return jsonOk(po);
  } catch (e) {
    return handleApiError(e);
  }
}

// PATCH /api/purchase-orders/[id] — changement de statut (envoyer / annuler)
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireResource("purchases");
    const body = (await req.json().catch(() => ({}))) as { status?: string };
    const allowed = ["SENT", "CANCELLED"];
    if (!body.status || !allowed.includes(body.status)) {
      throw new ApiError(400, "Statut invalide (SENT ou CANCELLED attendu)");
    }
    const po = await prisma.purchaseOrder.update({
      where: { id: ctx.params.id },
      data: { status: body.status as "SENT" | "CANCELLED" },
    });
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        resource: "PurchaseOrder",
        resourceId: po.id,
        details: { status: body.status },
      },
    });
    return jsonOk(po);
  } catch (e) {
    return handleApiError(e);
  }
}
