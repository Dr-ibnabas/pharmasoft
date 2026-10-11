import { prisma } from "@/lib/prisma";
import {
  jsonOk,
  handleApiError,
  parseBody,
  parseQuery,
  requireResource,
} from "@/lib/api-helpers";
import {
  prescriptionCreateSchema,
  prescriptionListQuerySchema,
} from "@/lib/validations/prescription";

export async function GET(req: Request) {
  try {
    await requireResource("prescriptions");
    const q = parseQuery(req, prescriptionListQuerySchema);

    const where = {
      ...(q.q
        ? {
            OR: [
              { code: { contains: q.q, mode: "insensitive" as const } },
              { doctorName: { contains: q.q, mode: "insensitive" as const } },
              { client: { name: { contains: q.q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
      ...(q.status ? { status: q.status } : {}),
      ...(q.clientId ? { clientId: q.clientId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        include: {
          client: { select: { name: true, phone: true, allergies: true } },
          items: { select: { id: true, quantity: true, dispensedQty: true, medicine: { select: { name: true, requiresPrescription: true } } } },
        },
        orderBy: { issuedDate: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.prescription.count({ where }),
    ]);

    return jsonOk({ items, total, page: q.page, pageSize: q.pageSize });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireResource("prescriptions");
    const data = await parseBody(req, prescriptionCreateSchema);

    const count = await prisma.prescription.count();
    const code = `RX-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

    const created = await prisma.prescription.create({
      data: {
        code,
        clientId: data.clientId,
        doctorName: data.doctorName,
        doctorContact: data.doctorContact,
        issuedDate: new Date(data.issuedDate),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        notes: data.notes,
        items: { create: data.items.map((i) => ({ ...i, dispensedQty: 0 })) },
      },
      include: { items: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        resource: "Prescription",
        resourceId: created.id,
        details: { code: created.code, items: data.items.length },
      },
    });

    return jsonOk(created, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
