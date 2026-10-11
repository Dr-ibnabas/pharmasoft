import { prisma } from "@/lib/prisma";
import {
  jsonOk,
  handleApiError,
  parseBody,
  requireResource,
  ApiError,
} from "@/lib/api-helpers";
import { userUpdateSchema } from "@/lib/validations/user";

// PATCH /api/users/[id] — Mise à jour (changement de rôle, activation/désactivation)
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireResource("users");
    const data = await parseBody(req, userUpdateSchema);

    const target = await prisma.user.findUnique({ where: { id: ctx.params.id } });
    if (!target) throw new ApiError(404, "Utilisateur introuvable");

    // Sécurités :
    //  - On ne peut pas désactiver son propre compte
    //  - Seul SUPER_ADMIN peut promouvoir SUPER_ADMIN/TITULAIRE
    if (data.isActive === false && target.id === session.user.id) {
      throw new ApiError(400, "Vous ne pouvez pas désactiver votre propre compte");
    }
    if (
      data.role &&
      (data.role === "SUPER_ADMIN" || data.role === "TITULAIRE") &&
      session.user.role !== "SUPER_ADMIN"
    ) {
      throw new ApiError(403, "Seul un Super Admin peut promouvoir à ce rôle");
    }

    const updated = await prisma.user.update({
      where: { id: ctx.params.id },
      data,
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        resource: "User",
        resourceId: updated.id,
        details: { fields: Object.keys(data) },
      },
    });

    return jsonOk(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
