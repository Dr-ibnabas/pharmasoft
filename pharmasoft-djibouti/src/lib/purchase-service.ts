import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-helpers";
import { nextDocNumber } from "@/lib/sequence";
import type { PurchaseOrderCreateInput, PurchaseReceiveInput } from "@/lib/validations/purchase";

// PHARMASOFT — Service Achats : création de bon de commande + réception marchandise.
// La réception est l'opération critique : elle fait ENTRER le stock dans le système
// (création automatique des lots + mouvements + mise à jour solde fournisseur).

interface Author {
  id: string;
  name: string;
}

/** Crée un bon de commande (statut DRAFT). */
export async function createPurchaseOrder(input: PurchaseOrderCreateInput, author: Author) {
  return await prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.findUnique({ where: { id: input.supplierId } });
    if (!supplier) throw new ApiError(404, "Fournisseur introuvable");

    const subtotal = input.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const { number } = await nextDocNumber(tx, "CMD");

    const po = await tx.purchaseOrder.create({
      data: {
        code: number,
        supplierId: input.supplierId,
        status: "DRAFT",
        subtotal,
        taxAmount: 0, // achats hors taxe pour la pharmacie (récupérée), ajustable
        total: subtotal,
        expectedAt: input.expectedAt ? new Date(input.expectedAt) : null,
        createdById: author.id,
        notes: input.notes ?? null,
        items: {
          create: input.items.map((i) => ({
            medicineId: i.medicineId,
            quantity: i.quantity,
            receivedQty: 0,
            unitPrice: i.unitPrice,
            lineTotal: i.unitPrice * i.quantity,
          })),
        },
      },
      include: { items: true },
    });

    await tx.auditLog.create({
      data: {
        userId: author.id,
        action: "PURCHASE_ORDER",
        resource: "PurchaseOrder",
        resourceId: po.id,
        details: { code: po.code, supplier: supplier.name, total: subtotal },
      },
    });

    return po;
  });
}

/**
 * Réceptionne (tout ou partie) d'un bon de commande.
 * Pour chaque ligne reçue :
 *   - crée/complète un Lot (medicineId, lotNumber) avec la quantité + date de péremption
 *   - crée un StockMovement IN_PURCHASE
 *   - incrémente receivedQty de la ligne de commande
 * Puis met à jour le statut (PARTIAL_RECEIVED / RECEIVED) et le solde fournisseur.
 */
export async function receivePurchaseOrder(
  poId: string,
  input: PurchaseReceiveInput,
  author: Author,
) {
  return await prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true, supplier: true },
    });
    if (!po) throw new ApiError(404, "Bon de commande introuvable");
    if (po.status === "RECEIVED" || po.status === "CANCELLED") {
      throw new ApiError(400, `Commande déjà ${po.status === "RECEIVED" ? "réceptionnée" : "annulée"}`);
    }

    let receivedValue = 0;

    for (const line of input.items) {
      if (line.receivedQty <= 0) continue;
      const item = po.items.find((i) => i.id === line.itemId);
      if (!item) throw new ApiError(400, `Ligne ${line.itemId} introuvable dans la commande`);

      const remaining = item.quantity - item.receivedQty;
      if (line.receivedQty > remaining) {
        throw new ApiError(400, `Quantité reçue (${line.receivedQty}) supérieure au reste à recevoir (${remaining})`);
      }

      // Crée ou complète le lot (clé unique medicineId + lotNumber)
      const existingLot = await tx.lot.findUnique({
        where: { medicineId_lotNumber: { medicineId: item.medicineId, lotNumber: line.lotNumber } },
      });

      let lotId: string;
      if (existingLot) {
        const updated = await tx.lot.update({
          where: { id: existingLot.id },
          data: {
            quantity: { increment: line.receivedQty },
            initialQty: { increment: line.receivedQty },
            purchasePrice: item.unitPrice,
            supplierId: po.supplierId,
          },
        });
        lotId = updated.id;
      } else {
        const created = await tx.lot.create({
          data: {
            medicineId: item.medicineId,
            lotNumber: line.lotNumber,
            quantity: line.receivedQty,
            initialQty: line.receivedQty,
            expiryDate: new Date(line.expiryDate),
            supplierId: po.supplierId,
            purchasePrice: item.unitPrice,
          },
        });
        lotId = created.id;
      }

      // Mouvement de stock entrant
      await tx.stockMovement.create({
        data: {
          medicineId: item.medicineId,
          lotId,
          type: "IN_PURCHASE",
          quantity: line.receivedQty,
          reference: po.id,
          reason: `Réception ${po.code}`,
          userId: author.id,
        },
      });

      // Incrémente la quantité reçue de la ligne
      await tx.purchaseOrderItem.update({
        where: { id: item.id },
        data: { receivedQty: { increment: line.receivedQty } },
      });

      receivedValue += item.unitPrice * line.receivedQty;
    }

    // Recalcule le statut global
    const refreshed = await tx.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true },
    });
    const allReceived = refreshed!.items.every((i) => i.receivedQty >= i.quantity);
    const anyReceived = refreshed!.items.some((i) => i.receivedQty > 0);
    const newStatus = allReceived ? "RECEIVED" : anyReceived ? "PARTIAL_RECEIVED" : po.status;

    await tx.purchaseOrder.update({
      where: { id: poId },
      data: {
        status: newStatus,
        receivedAt: allReceived ? new Date() : po.receivedAt,
      },
    });

    // Le solde dû au fournisseur augmente de la valeur réceptionnée
    if (receivedValue > 0) {
      await tx.supplier.update({
        where: { id: po.supplierId },
        data: { balance: { increment: receivedValue } },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: author.id,
        action: "PURCHASE_RECEIVE",
        resource: "PurchaseOrder",
        resourceId: po.id,
        details: { code: po.code, value: receivedValue, status: newStatus },
      },
    });

    await tx.notification.create({
      data: {
        type: "ORDER_RECEIVED",
        title: `Livraison ${po.code} réceptionnée`,
        message: `Réception depuis ${po.supplier.name} — ${newStatus === "RECEIVED" ? "complète" : "partielle"}.`,
        link: `/achats/${po.id}`,
      },
    });

    return { status: newStatus, receivedValue };
  });
}
