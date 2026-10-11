import { prisma } from "@/lib/prisma";
import {
  jsonOk,
  handleApiError,
  parseBody,
  parseQuery,
  requireResource,
} from "@/lib/api-helpers";
import { clientCreateSchema, clientListQuerySchema } from "@/lib/validations/client";

// GET /api/clients — Liste avec filtres
export async function GET(req: Request) {
  try {
    await requireResource("clients");
    const q = parseQuery(req, clientListQuerySchema);

    const where = {
      deletedAt: null,
      ...(q.q
        ? {
            OR: [
              { name: { contains: q.q, mode: "insensitive" as const } },
              { phone: { contains: q.q } },
              { code: { contains: q.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(q.tier ? { tier: q.tier } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.client.count({ where }),
    ]);

    return jsonOk({ items, total, page: q.page, pageSize: q.pageSize });
  } catch (e) {
    return handleApiError(e);
  }
}

// POST /api/clients — Création
export async function POST(req: Request) {
  try {
    const session = await requireResource("clients");
    const data = await parseBody(req, clientCreateSchema);

    // Code auto si non fourni : C + 3 digits (next id)
    let code = data.code;
    if (!code) {
      const count = await prisma.client.count();
      code = `C${String(count + 1).padStart(3, "0")}`;
    }

    const created = await prisma.client.create({
      data: {
        ...data,
        code,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        allergies: data.allergies ?? [],
        conditions: data.conditions ?? [],
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        resource: "Client",
        resourceId: created.id,
        details: { name: created.name, code: created.code },
      },
    });

    return jsonOk(created, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
