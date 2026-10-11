import { prisma } from "@/lib/prisma";
import {
  jsonOk,
  handleApiError,
  parseBody,
  requireResource,
} from "@/lib/api-helpers";
import { settingsUpdateSchema } from "@/lib/validations/settings";

// GET /api/settings — Lecture des paramètres (SUPER_ADMIN, TITULAIRE)
export async function GET() {
  try {
    await requireResource("settings");
    const setting = await prisma.setting.findFirst();
    return jsonOk(setting);
  } catch (e) {
    return handleApiError(e);
  }
}

// PATCH /api/settings — Mise à jour
export async function PATCH(req: Request) {
  try {
    const session = await requireResource("settings");
    const data = await parseBody(req, settingsUpdateSchema);

    const existing = await prisma.setting.findFirst();
    const updated = existing
      ? await prisma.setting.update({ where: { id: existing.id }, data })
      : await prisma.setting.create({
          data: {
            pharmacyName: data.pharmacyName ?? "Pharmacie",
            address: data.address ?? "",
            city: data.city ?? "",
            phone: data.phone ?? "",
            nif: data.nif ?? "",
            ...data,
          },
        });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SETTINGS_UPDATE",
        resource: "Setting",
        resourceId: String(updated.id),
        details: { fields: Object.keys(data) },
      },
    });

    return jsonOk(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
