import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { MedicinesTable, type MedicineRow } from "@/components/medicaments/medicines-table";
import { MedicineFormDialog } from "@/components/medicaments/medicine-form-dialog";
import { canSeePurchasePrice } from "@/lib/permissions";

// PHARMASOFT — Liste des médicaments.
// Server component qui fetch et passe au DataTable client.
export default async function MedicamentsPage() {
  const session = await auth();
  if (!session?.user) return null;
  const role = session.user.role;
  const seePurchase = canSeePurchasePrice(role);

  const medicines = await prisma.medicine.findMany({
    where: { deletedAt: null },
    include: { lots: { select: { quantity: true } } },
    orderBy: { name: "asc" },
  });

  const rows: MedicineRow[] = medicines.map((m) => {
    const stock = m.lots.reduce((s, l) => s + l.quantity, 0);
    const status: "ok" | "low" | "out" = stock === 0 ? "out" : stock <= m.lowStockThreshold ? "low" : "ok";
    return {
      id: m.id,
      code: m.code,
      name: m.name,
      dci: m.dci,
      form: m.form,
      dosage: m.dosage,
      laboratory: m.laboratory,
      category: m.category,
      sellPrice: m.sellPrice,
      ...(seePurchase ? { purchasePrice: m.purchasePrice } : {}),
      stock,
      status,
      requiresPrescription: m.requiresPrescription,
    };
  });

  return (
    <div>
      <PageHeader
        title="Médicaments"
        description={`${rows.length} produits actifs dans le catalogue`}
        actions={
          role === "TITULAIRE" ? (
            <MedicineFormDialog
              mode="create"
              canSeePurchase={seePurchase}
              trigger={
                <Button>
                  <Plus size={14} />
                  Nouveau médicament
                </Button>
              }
            />
          ) : null
        }
      />
      <MedicinesTable data={rows} canSeePurchase={seePurchase} />
    </div>
  );
}
