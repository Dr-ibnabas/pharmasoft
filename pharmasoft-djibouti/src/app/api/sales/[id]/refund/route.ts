import { jsonOk, handleApiError, parseBody, requireResource } from "@/lib/api-helpers";
import { refundCreateSchema } from "@/lib/validations/refund";
import { createRefund } from "@/lib/refund-service";

// POST /api/sales/[id]/refund — retour / avoir sur une vente
export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireResource("pos");
    const data = await parseBody(req, refundCreateSchema);
    const result = await createRefund(ctx.params.id, data, {
      id: session.user.id,
      name: session.user.name ?? session.user.email ?? "—",
    });
    return jsonOk(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
