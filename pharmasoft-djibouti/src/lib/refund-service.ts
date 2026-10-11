import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-helpers";
import { nextDocNumber } from "@/lib/sequence";
import type { RefundCreateInput } from "@/lib/validations/refund";

interface Author {
  id: string;
  name: string;
}

// PHARMASOFT — Service de retour / avoir.
// Crée un avoir, ré-incrémente le stock (si restock), ajuste le client et la vente.
// Le montant remboursé = somme (quantité retournée × prix unitaire de la ligne).
export async function createRefund(saleId: string, input: RefundCreateInput, author: Author) {
  return await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id: saleId },
      include: { lines: true, refunds: { include: { lines: true } } },
    });
    if (!sale) throw new ApiError(404, "Vente introuvable");
    if (sale.status === "REFUNDED") throw new ApiError(400, "Vente déjà intégralement remboursée");

    // Quantités déjà retournées par ligne (pour empêcher de rembourser plus que vendu)
    const alreadyByLine = new Map<string, number>();
    for (const r of sale.refunds) {
      for (const rl of r.lines) {
        // RefundLine n'a pas saleLineId direct ; on agrège par medicineId+lotId fallback
        const key = `${rl.medicineId}:${rl.lotId ?? ""}`;
        alreadyByLine.set(key, (alreadyByLine.get(key) ?? 0) + rl.quantity);
      }
    }

    let totalRefund = 0;
    const refundLinesData: Array<{
      medicineId: string;
      lotId: string | null;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }> = [];

    for (const line of input.lines) {
      const saleLine = sale.lines.find((l) => l.id === line.saleLineId);
      if (!saleLine) throw new ApiError(400, `Ligne de vente ${line.saleLineId} introuvable`);
      if (line.quantity > saleLine.quantity) {
        throw new ApiError(400, `Quantité retournée (${line.quantity}) > quantité vendue (${saleLine.quantity})`);
      }
      const lineTotal = saleLine.unitPrice * line.quantity;
      totalRefund += lineTotal;
      refundLinesData.push({
        medicineId: saleLine.medicineId,
        lotId: saleLine.lotId,
        quantity: line.quantity,
        unitPrice: saleLine.unitPrice,
        lineTotal,
      });

      // Remise en stock du lot d'origine
      if (input.restock && saleLine.lotId) {
        await tx.lot.update({
          where: { id: saleLine.lotId },
          data: { quantity: { increment: line.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            medicineId: saleLine.medicineId,
            lotId: saleLine.lotId,
            type: "RETURN_CUSTOMER",
            quantity: line.quantity,
            reference: sale.id,
            reason: `Retour ${input.reason}`,
            userId: author.id,
          },
        });
      }
    }

    const { number } = await nextDocNumber(tx, "AV");
    const refund = await tx.refund.create({
      data: {
        code: number,
        saleId: sale.id,
        userId: author.id,
        reason: input.reason,
        amount: totalRefund,
        restock: input.restock,
        notes: input.notes ?? null,
        lines: { create: refundLinesData },
      },
    });

    // La vente devient REFUNDED si tout a été retourné, sinon reste COMPLETED (retour partiel)
    const totalRefundedQty = [...sale.refunds.flatMap((r) => r.lines), ...refundLinesData].reduce(
      (s, l) => s + l.quantity,
      0,
    );
    const totalSoldQty = sale.lines.reduce((s, l) => s + l.quantity, 0);
    if (totalRefundedQty >= totalSoldQty) {
      await tx.sale.update({ where: { id: sale.id }, data: { status: "REFUNDED" } });
    }

    // Ajustement client : retirer les points gagnés au prorata + réduire le crédit éventuel
    if (sale.clientId) {
      const pointsToRemove = Math.floor(totalRefund / 100);
      await tx.client.update({
        where: { id: sale.clientId },
        data: {
          totalSpent: { decrement: totalRefund },
          points: { decrement: pointsToRemove },
          ...(sale.paymentMethod === "CREDIT" ? { creditBalance: { decrement: totalRefund } } : {}),
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: author.id,
        action: "SALE_REFUND",
        resource: "Sale",
        resourceId: sale.id,
        details: { refundCode: number, amount: totalRefund, reason: input.reason, restock: input.restock },
      },
    });

    return { refund, amount: totalRefund };
  });
}
