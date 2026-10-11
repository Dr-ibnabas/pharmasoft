import bcrypt from "bcryptjs";
import { Prisma, type Role, type PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-helpers";
import { nextSequenceValue } from "@/lib/sequence";
import type { SaleCreateInput } from "@/lib/validations/sale";

interface SaleAuthor {
  id: string;
  name: string;
  role: Role;
}

// PHARMASOFT — Service central de création d'une vente (transactionnel).
// Gère : validation PIN (Rx), FIFO lots, total/TVA, remise, fidélité dépensable,
// tiers-payant (part assurance vs part client), paiements multiples + monnaie rendue,
// décrément stock + mouvements, mise à jour ordonnance, claim assurance,
// mise à jour client (points, crédit), registre des stupéfiants, audit.
export async function createSale(input: SaleCreateInput, author: SaleAuthor) {
  return await prisma.$transaction(
    async (tx) => {
      const medicineIds = input.lines.map((l) => l.medicineId);
      const medicines = await tx.medicine.findMany({
        where: { id: { in: medicineIds }, deletedAt: null },
        include: { lots: { where: { quantity: { gt: 0 } }, orderBy: { expiryDate: "asc" } } },
      });

      // ─── 1. PIN si Rx + rôle non-TITULAIRE ──────────────────
      const hasRx = medicines.some((m) => m.requiresPrescription);
      const hasControlled = medicines.some((m) => m.controlledSubstance);
      const needsPin = hasRx && author.role !== "TITULAIRE";
      let validatedByUserId: string | null = null;
      let validatedAt: Date | null = null;

      if (needsPin) {
        if (!input.validationPin) throw new ApiError(422, "PIN_REQUIRED");
        const titulaire = await tx.user.findFirst({ where: { role: "TITULAIRE", isActive: true } });
        if (!titulaire?.validationPin) throw new ApiError(500, "Aucun PIN titulaire configuré");
        const ok = await bcrypt.compare(input.validationPin, titulaire.validationPin);
        if (!ok) throw new ApiError(401, "PIN du pharmacien incorrect");
        validatedByUserId = titulaire.id;
        validatedAt = new Date();
      }

      // ─── 2. FIFO lot (un lot par ligne) ─────────────────────
      type Resolved = {
        medicineId: string;
        lotId: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        prescriptionId: string | null;
        controlled: boolean;
        name: string;
      };
      const resolved: Resolved[] = [];
      for (const line of input.lines) {
        const med = medicines.find((m) => m.id === line.medicineId);
        if (!med) throw new ApiError(400, `Médicament ${line.medicineId} introuvable`);
        const lot = med.lots.find((l) => l.quantity >= line.quantity);
        if (!lot) {
          throw new ApiError(
            400,
            `Stock insuffisant pour ${med.name} (demandé : ${line.quantity}, max sur un lot : ${med.lots[0]?.quantity ?? 0})`,
          );
        }
        resolved.push({
          medicineId: med.id,
          lotId: lot.id,
          quantity: line.quantity,
          unitPrice: med.sellPrice,
          lineTotal: med.sellPrice * line.quantity,
          prescriptionId: line.prescriptionId ?? null,
          controlled: med.controlledSubstance,
          name: med.name,
        });
      }

      // ─── 3. Total + TVA + remise + fidélité ─────────────────
      const setting = await tx.setting.findFirst();
      const taxRate = setting ? Number(setting.tvaRate) : 0.1;
      const subtotal = resolved.reduce((s, l) => s + l.lineTotal, 0);
      const pctDiscount = Math.round((subtotal * input.discountPercent) / 100);

      // Fidélité dépensable : 1 point = 1 Fdj, plafonné aux points du client et au sous-total
      let client = input.clientId
        ? await tx.client.findUnique({
            where: { id: input.clientId },
            include: { insuranceMembers: { where: { isActive: true }, include: { insurance: true } } },
          })
        : null;
      let pointsRedeemed = 0;
      if (client && input.pointsToRedeem > 0) {
        pointsRedeemed = Math.min(input.pointsToRedeem, client.points, subtotal - pctDiscount);
      }

      const discountAmount = pctDiscount + pointsRedeemed;
      const taxableBase = subtotal - discountAmount;
      const taxAmount = Math.round(taxableBase * taxRate);
      const total = taxableBase + taxAmount;

      // ─── 4. Tiers-payant (part assurance vs part client) ────
      let insuranceCovered = 0;
      let insuranceMemberId: string | null = null;
      let insuranceId: string | null = null;
      if (input.useInsurance && client) {
        const member = client.insuranceMembers[0];
        if (!member) throw new ApiError(400, "Le client n'a pas d'assurance active");
        insuranceCovered = Math.round((total * member.insurance.coverageRate) / 100);
        insuranceMemberId = member.id;
        insuranceId = member.insuranceId;
      }
      const clientDue = total - insuranceCovered;

      // ─── 5. Paiements : la somme doit couvrir le reste à charge ──
      const amountPaid = input.payments.reduce((s, p) => s + p.amount, 0);
      const usesCredit = input.payments.some((p) => p.method === "CREDIT");
      // Le crédit peut laisser un reste dû ; sinon il faut couvrir clientDue.
      if (!usesCredit && amountPaid < clientDue) {
        throw new ApiError(400, `Paiement insuffisant : ${amountPaid} Fdj reçu, ${clientDue} Fdj attendu`);
      }
      // Monnaie rendue = trop-perçu en espèces uniquement
      const cashPaid = input.payments.filter((p) => p.method === "CASH").reduce((s, p) => s + p.amount, 0);
      const overpay = Math.max(0, amountPaid - clientDue);
      const changeGiven = Math.min(overpay, cashPaid);

      const paymentMethod: PaymentMethod =
        insuranceCovered > 0 && input.payments.length === 0
          ? "INSURANCE"
          : input.payments.length > 1
            ? "MIXED"
            : (input.payments[0]?.method ?? "CASH");

      // ─── 6. Session de caisse (si un paiement espèces) ──────
      let cashSessionId: string | null = null;
      if (input.payments.some((p) => p.method === "CASH")) {
        const cs = await tx.cashSession.findFirst({ where: { closedAt: null }, orderBy: { openedAt: "desc" } });
        cashSessionId = cs?.id ?? null;
      }

      // ─── 7. Numéro de ticket (compteur journalier) ──────────
      const today0 = new Date();
      today0.setHours(0, 0, 0, 0);
      const todayCount = await tx.sale.count({ where: { createdAt: { gte: today0 } } });
      const ticketNumber = `#${String(todayCount + 1).padStart(5, "0")}`;

      // ─── 8. Création vente + lignes + paiements ─────────────
      const sale = await tx.sale.create({
        data: {
          ticketNumber,
          userId: author.id,
          clientId: input.clientId ?? null,
          cashSessionId,
          subtotal,
          discountPercent: new Prisma.Decimal(input.discountPercent),
          discountAmount,
          taxRate: new Prisma.Decimal(taxRate),
          taxAmount,
          total,
          paymentMethod,
          status: "COMPLETED",
          validatedByUserId,
          validatedAt,
          insuranceCovered,
          clientDue,
          amountPaid,
          changeGiven,
          lines: {
            create: resolved.map((l) => ({
              medicineId: l.medicineId,
              lotId: l.lotId,
              prescriptionId: l.prescriptionId,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              discountPercent: new Prisma.Decimal(0),
              lineTotal: l.lineTotal,
            })),
          },
          payments: {
            create: input.payments.map((p) => ({
              method: p.method,
              amount: p.amount,
              reference: p.reference ?? null,
            })),
          },
        },
        include: {
          lines: { include: { medicine: { select: { name: true, form: true, dosage: true } } } },
          client: { select: { name: true, phone: true, allergies: true } },
          payments: true,
        },
      });

      // ─── 9. Décrément stock + mouvements + ordonnance + stupéfiants ──
      for (const l of resolved) {
        const updatedLot = await tx.lot.update({
          where: { id: l.lotId },
          data: { quantity: { decrement: l.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            medicineId: l.medicineId,
            lotId: l.lotId,
            type: "OUT_SALE",
            quantity: -l.quantity,
            reference: sale.id,
            userId: author.id,
          },
        });
        if (l.prescriptionId) {
          const items = await tx.prescriptionItem.findMany({
            where: { prescriptionId: l.prescriptionId, medicineId: l.medicineId },
          });
          for (const item of items) {
            await tx.prescriptionItem.update({
              where: { id: item.id },
              data: { dispensedQty: { increment: l.quantity } },
            });
          }
        }

        // Registre des stupéfiants (obligation légale) : une entrée par produit contrôlé
        if (l.controlled) {
          const entryNumber = await nextSequenceValue(tx, "controlled-register");
          // Stock restant total pour ce médicament après délivrance
          const remaining = await tx.lot.aggregate({
            where: { medicineId: l.medicineId },
            _sum: { quantity: true },
          });
          await tx.controlledRegisterEntry.create({
            data: {
              entryNumber,
              saleId: sale.id,
              medicineId: l.medicineId,
              userId: author.id,
              quantity: l.quantity,
              clientName: sale.client?.name ?? null,
              clientPhone: sale.client?.phone ?? null,
              balanceAfter: remaining._sum.quantity ?? 0,
            },
          });
        }
      }

      // ─── 10. Statut d'ordonnance ────────────────────────────
      const rxIds = Array.from(new Set(resolved.map((l) => l.prescriptionId).filter(Boolean) as string[]));
      for (const rxId of rxIds) {
        const items = await tx.prescriptionItem.findMany({ where: { prescriptionId: rxId } });
        const allDone = items.every((i) => i.dispensedQty >= i.quantity);
        await tx.prescription.update({
          where: { id: rxId },
          data: { status: allDone ? "FULFILLED" : "PARTIAL" },
        });
      }

      // ─── 11. Claim assurance (tiers-payant) ─────────────────
      if (insuranceCovered > 0 && insuranceId) {
        await tx.insuranceClaim.create({
          data: {
            saleId: sale.id,
            insuranceId,
            amountClaimed: insuranceCovered,
            status: "PENDING",
          },
        });
      }

      // ─── 12. Mise à jour client (points, crédit) ────────────
      if (client) {
        const creditIncrease = input.payments
          .filter((p) => p.method === "CREDIT")
          .reduce((s, p) => s + p.amount, 0);
        const pointsEarned = Math.floor(clientDue / 100);
        await tx.client.update({
          where: { id: client.id },
          data: {
            totalSpent: { increment: total },
            lastVisit: new Date(),
            points: { increment: pointsEarned - pointsRedeemed },
            ...(creditIncrease > 0 ? { creditBalance: { increment: creditIncrease } } : {}),
          },
        });
      }

      // ─── 13. Audit ──────────────────────────────────────────
      await tx.auditLog.create({
        data: {
          userId: author.id,
          action: "SALE_COMPLETE",
          resource: "Sale",
          resourceId: sale.id,
          details: {
            ticketNumber,
            total,
            insuranceCovered,
            clientDue,
            methods: input.payments.map((p) => p.method),
            hasRx,
            hasControlled,
          },
        },
      });
      if (hasControlled) {
        await tx.auditLog.create({
          data: {
            userId: author.id,
            action: "CONTROLLED_DISPENSE",
            resource: "Sale",
            resourceId: sale.id,
            details: { ticketNumber },
          },
        });
      }

      return { ...sale, changeGiven };
    },
    { timeout: 20_000 },
  );
}
