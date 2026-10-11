import {
  jsonOk,
  handleApiError,
  parseBody,
  requireResource,
} from "@/lib/api-helpers";
import { saleCreateSchema } from "@/lib/validations/sale";
import { createSale } from "@/lib/sale-service";

// POST /api/sales — Finalisation d'une vente.
// Accessible aux rôles qui peuvent utiliser le POS : TITULAIRE, VENDEUR, CAISSIER.
// SUPER_ADMIN n'a pas accès au POS (D-012).
export async function POST(req: Request) {
  try {
    const session = await requireResource("pos");
    const data = await parseBody(req, saleCreateSchema);
    const sale = await createSale(data, {
      id: session.user.id,
      name: session.user.name ?? session.user.email ?? "—",
      role: session.user.role,
    });
    return jsonOk(sale, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
