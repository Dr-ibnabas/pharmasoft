import { prisma } from "@/lib/prisma";
import { jsonOk, handleApiError, parseBody, requireResource } from "@/lib/api-helpers";
import { purchaseOrderCreateSchema } from "@/lib/validations/purchase";
import { createPurchaseOrder } from "@/lib/purchase-service";

// GET /api/purchase-orders — liste des bons de commande
export async function GET() {
  try {
    await requireResource("purchases");
    const items = await prisma.purchaseOrder.findMany({
      include: {
        supplier: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { orderedAt: "desc" },
      take: 100,
    });
    return jsonOk({ items });
  } catch (e) {
    return handleApiError(e);
  }
}

// POST /api/purchase-orders — création
export async function POST(req: Request) {
  try {
    const session = await requireResource("purchases");
    const data = await parseBody(req, purchaseOrderCreateSchema);
    const po = await createPurchaseOrder(data, {
      id: session.user.id,
      name: session.user.name ?? session.user.email ?? "—",
    });
    return jsonOk(po, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
