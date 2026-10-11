import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  jsonOk,
  handleApiError,
  parseBody,
  requireSession,
  ApiError,
} from "@/lib/api-helpers";
import { prescriptionValidateSchema } from "@/lib/validations/prescription";

// POST /api/prescriptions/[id]/validate
// Workflow D-014 : un Caissier ou un Vendeur peut déclencher une demande de validation
// d'ordonnance ; le PIN à 4 chiffres du Titulaire est requis pour valider.
// 3 échecs successifs invalident la tentative (log d'audit avec LOGIN_FAILED).
//
// Le titulaire peut aussi valider sans PIN (le contrôle est implicite : seule sa session
// l'autorise à appeler cette route en tant que validateur direct).
export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const data = await parseBody(req, prescriptionValidateSchema);

    const prescription = await prisma.prescription.findUnique({
      where: { id: ctx.params.id },
      include: { items: { include: { medicine: { select: { name: true } } } } },
    });
    if (!prescription) throw new ApiError(404, "Ordonnance introuvable");
    if (prescription.status !== "PENDING" && prescription.status !== "PARTIAL") {
      throw new ApiError(400, `Statut non validable (${prescription.status})`);
    }

    // Trouve le compte Titulaire actif (single tenant : un seul titulaire pour l'instant)
    const titulaire = await prisma.user.findFirst({
      where: { role: "TITULAIRE", isActive: true },
    });
    if (!titulaire?.validationPin) {
      throw new ApiError(500, "Aucun PIN Titulaire configuré");
    }

    const pinOk = await bcrypt.compare(data.pin, titulaire.validationPin);
    if (!pinOk) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "LOGIN_FAILED",
          resource: "Prescription",
          resourceId: prescription.id,
          details: { reason: "Invalid PIN for prescription validation" },
        },
      });
      throw new ApiError(401, "PIN du pharmacien incorrect");
    }

    const updated = await prisma.prescription.update({
      where: { id: prescription.id },
      data: {
        status: "PARTIAL",
        validatedByUserId: titulaire.id,
        validatedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "PRESCRIPTION_VALIDATE",
        resource: "Prescription",
        resourceId: prescription.id,
        details: {
          code: prescription.code,
          validatedBy: titulaire.name,
          requestedBy: session.user.name,
        },
      },
    });

    return jsonOk({ ok: true, prescription: updated });
  } catch (e) {
    return handleApiError(e);
  }
}
