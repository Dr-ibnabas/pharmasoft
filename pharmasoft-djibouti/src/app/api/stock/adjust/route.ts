import { prisma } from "@/lib/prisma";
import {
  jsonOk,
  handleApiError,
  parseBody,
  requireResource,
  ApiError,
} from "@/lib/api-helpers";
import { stockAdjustSchema } from "@/lib/validations/lot";

// POST /api/stock/adjust — Ajustement de quantité d'un lot.
// Crée un StockMovement et met à jour Lot.quantity dans une transaction.
// Réservé au TITULAIRE (D-013 : modification des stocks).
export async function POST(req: Request) {
  try {
    const session = await requireResource("stock");
    if (session.user.role !== "TITULAIRE") {
      throw new ApiError(403, "Ajustement de stock réservé au pharmacien titulaire");
    }
    const data = await parseBody(req, stockAdjustSchema);

    const lot = await prisma.lot.findUnique({ where: { id: data.lotId } });
    if (!lot) throw new ApiError(404, "Lot introuvable");

    const newQty = lot.quantity + data.delta;
    if (newQty < 0) throw new ApiError(400, `Stock insuffisant (lot actuel : ${lot.quantity})`);

    await prisma.$transaction([
      prisma.lot.update({
        where: { id: lot.id },
        data: { quantity: newQty },
      }),
      prisma.stockMovement.create({
        data: {
          medicineId: lot.medicineId,
          lotId: lot.id,
          type: data.type,
          quantity: data.delta,
          reason: data.reason,
          userId: session.user.id,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "STOCK_ADJUST",
          resource: "Lot",
          resourceId: lot.id,
          details: { delta: data.delta, type: data.type, reason: data.reason },
        },
      }),
    ]);

    return jsonOk({ ok: true, newQuantity: newQty });
  } catch (e) {
    return handleApiError(e);
  }
}
