import { prisma } from "@/lib/prisma";
import {
  jsonOk,
  handleApiError,
  parseBody,
  requireResource,
  ApiError,
} from "@/lib/api-helpers";
import { medicineUpdateSchema } from "@/lib/validations/medicine";
import { scrubMedicineForRole } from "@/lib/scrub";

// GET /api/medicines/[id] — Fiche médicament
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireResource("medicines");
    const medicine = await prisma.medicine.findUnique({
      where: { id: ctx.params.id },
      include: {
        lots: {
          where: { quantity: { gt: 0 } },
          include: { supplier: { select: { name: true } } },
          orderBy: { expiryDate: "asc" },
        },
        _count: { select: { saleLines: true } },
      },
    });
    if (!medicine || medicine.deletedAt) {
      throw new ApiError(404, "Médicament introuvable");
    }
    return jsonOk(scrubMedicineForRole(medicine, session.user.role));
  } catch (e) {
    return handleApiError(e);
  }
}

// PATCH /api/medicines/[id] — Mise à jour (Titulaire uniquement)
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireResource("medicines");
    if (session.user.role !== "TITULAIRE") {
      throw new ApiError(403, "Modification réservée au pharmacien titulaire");
    }
    const data = await parseBody(req, medicineUpdateSchema);

    const existing = await prisma.medicine.findUnique({ where: { id: ctx.params.id } });
    if (!existing) throw new ApiError(404, "Médicament introuvable");

    const updated = await prisma.medicine.update({
      where: { id: ctx.params.id },
      data,
    });

    // Log spécifique si changement de prix
    const priceChanged = data.sellPrice !== undefined && data.sellPrice !== existing.sellPrice;
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: priceChanged ? "PRICE_CHANGE" : "UPDATE",
        resource: "Medicine",
        resourceId: updated.id,
        details: priceChanged
          ? { from: existing.sellPrice, to: updated.sellPrice, name: updated.name }
          : { fields: Object.keys(data) },
      },
    });

    return jsonOk(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

// DELETE /api/medicines/[id] — Soft delete (Titulaire uniquement)
export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireResource("medicines");
    if (session.user.role !== "TITULAIRE") {
      throw new ApiError(403, "Suppression réservée au pharmacien titulaire");
    }
    const deleted = await prisma.medicine.update({
      where: { id: ctx.params.id },
      data: { deletedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        resource: "Medicine",
        resourceId: deleted.id,
        details: { name: deleted.name, code: deleted.code },
      },
    });
    return jsonOk({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
