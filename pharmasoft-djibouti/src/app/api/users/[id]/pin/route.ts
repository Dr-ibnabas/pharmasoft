import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  jsonOk,
  handleApiError,
  parseBody,
  requireSession,
  ApiError,
} from "@/lib/api-helpers";
import { pinChangeSchema } from "@/lib/validations/user";

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS ?? "10", 10);

// PATCH /api/users/[id]/pin — Changement du PIN.
// L'utilisateur ne peut changer QUE son propre PIN.
// SUPER_ADMIN peut reset le PIN d'un Titulaire (sans currentPin).
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const data = await parseBody(req, pinChangeSchema);

    const target = await prisma.user.findUnique({ where: { id: ctx.params.id } });
    if (!target) throw new ApiError(404, "Utilisateur introuvable");
    if (target.role !== "TITULAIRE") {
      throw new ApiError(400, "Seul le Titulaire dispose d'un PIN de validation");
    }

    const isSelf = target.id === session.user.id;
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isSelf && !isSuperAdmin) {
      throw new ApiError(403, "Vous ne pouvez modifier que votre propre PIN");
    }

    // Si c'est soi-même → vérifier currentPin contre le hash existant
    if (isSelf && target.validationPin) {
      if (!data.currentPin) throw new ApiError(400, "PIN actuel requis");
      const ok = await bcrypt.compare(data.currentPin, target.validationPin);
      if (!ok) throw new ApiError(401, "PIN actuel incorrect");
    }

    const hashedPin = await bcrypt.hash(data.newPin, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: target.id },
      data: { validationPin: hashedPin },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        resource: "User",
        resourceId: target.id,
        details: { pinChanged: true, by: isSuperAdmin && !isSelf ? "SUPER_ADMIN_RESET" : "SELF" },
      },
    });

    return jsonOk({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
