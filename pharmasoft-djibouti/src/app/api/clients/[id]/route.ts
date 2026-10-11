import { prisma } from "@/lib/prisma";
import {
  jsonOk,
  handleApiError,
  parseBody,
  requireResource,
  ApiError,
} from "@/lib/api-helpers";
import { clientUpdateSchema } from "@/lib/validations/client";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    await requireResource("clients");
    const client = await prisma.client.findUnique({
      where: { id: ctx.params.id },
      include: {
        insuranceMembers: { include: { insurance: { select: { name: true, coverageRate: true } } } },
        _count: { select: { sales: true, prescriptions: true } },
      },
    });
    if (!client || client.deletedAt) throw new ApiError(404, "Client introuvable");
    return jsonOk(client);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireResource("clients");
    const data = await parseBody(req, clientUpdateSchema);

    const updated = await prisma.client.update({
      where: { id: ctx.params.id },
      data: {
        ...data,
        ...(data.dateOfBirth ? { dateOfBirth: new Date(data.dateOfBirth) } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        resource: "Client",
        resourceId: updated.id,
        details: { fields: Object.keys(data) },
      },
    });

    return jsonOk(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
