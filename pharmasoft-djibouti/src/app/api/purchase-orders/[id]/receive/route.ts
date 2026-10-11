import { jsonOk, handleApiError, parseBody, requireResource } from "@/lib/api-helpers";
import { purchaseReceiveSchema } from "@/lib/validations/purchase";
import { receivePurchaseOrder } from "@/lib/purchase-service";

// POST /api/purchase-orders/[id]/receive — réception de marchandise → lots
export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireResource("purchases");
    const data = await parseBody(req, purchaseReceiveSchema);
    const result = await receivePurchaseOrder(ctx.params.id, data, {
      id: session.user.id,
      name: session.user.name ?? session.user.email ?? "—",
    });
    return jsonOk(result);
  } catch (e) {
    return handleApiError(e);
  }
}
