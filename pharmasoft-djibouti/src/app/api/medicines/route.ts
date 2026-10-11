import { prisma } from "@/lib/prisma";
import {
  jsonOk,
  handleApiError,
  parseBody,
  parseQuery,
  requireResource,
  ApiError,
} from "@/lib/api-helpers";
import {
  medicineCreateSchema,
  medicineListQuerySchema,
} from "@/lib/validations/medicine";
import { scrubMedicinesForRole } from "@/lib/scrub";

// GET /api/medicines — Liste des médicaments avec filtres et stock agrégé.
export async function GET(req: Request) {
  try {
    const session = await requireResource("medicines");
    const q = parseQuery(req, medicineListQuerySchema);

    const where = {
      deletedAt: null,
      ...(q.q
        ? {
            OR: [
              { name: { contains: q.q, mode: "insensitive" as const } },
              { dci: { contains: q.q, mode: "insensitive" as const } },
              { code: { contains: q.q, mode: "insensitive" as const } },
              { barcode: { contains: q.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(q.category ? { category: q.category } : {}),
    };

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        include: {
          lots: { select: { quantity: true, expiryDate: true } },
        },
        orderBy: { name: "asc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.medicine.count({ where }),
    ]);

    // Calcule stock total + statut côté serveur
    const items = medicines.map((m) => {
      const stock = m.lots.reduce((s, l) => s + l.quantity, 0);
      const status: "ok" | "low" | "out" = stock === 0 ? "out" : stock <= m.lowStockThreshold ? "low" : "ok";
      const nextExpiry = m.lots
        .filter((l) => l.quantity > 0)
        .map((l) => l.expiryDate)
        .sort((a, b) => a.getTime() - b.getTime())[0]
        ?? null;
      const { lots: _lots, ...rest } = m;
      return { ...rest, stock, status, nextExpiry };
    });

    // Filtrage post-query par status (impossible à faire en SQL directement avec Prisma)
    const filtered = q.status === "all" ? items : items.filter((i) => i.status === q.status);

    // Masque purchasePrice si pas Titulaire
    const scrubbed = scrubMedicinesForRole(filtered, session.user.role);

    return jsonOk({ items: scrubbed, total, page: q.page, pageSize: q.pageSize });
  } catch (e) {
    return handleApiError(e);
  }
}

// POST /api/medicines — Création (Titulaire uniquement)
export async function POST(req: Request) {
  try {
    const session = await requireResource("medicines");
    if (session.user.role !== "TITULAIRE") {
      throw new ApiError(403, "Création réservée au pharmacien titulaire");
    }
    const data = await parseBody(req, medicineCreateSchema);

    const created = await prisma.medicine.create({ data });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        resource: "Medicine",
        resourceId: created.id,
        details: { name: created.name, code: created.code },
      },
    });

    return jsonOk(created, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
