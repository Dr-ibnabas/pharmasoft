import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/page-header";
import { Truck, Phone, Mail } from "lucide-react";
import { fmtMoney, fmtDate } from "@/lib/utils";

export default async function FournisseursPage() {
  const session = await auth();
  if (!session?.user) return null;

  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { lots: true, purchaseOrders: true } },
    },
    orderBy: { name: "asc" },
  });

  const totalDebt = suppliers.reduce((s, sup) => s + sup.balance, 0);

  return (
    <div>
      <PageHeader
        title="Fournisseurs & Achats"
        description={`${suppliers.length} fournisseurs actifs · Solde global dû : ${fmtMoney(totalDebt)}`}
      />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s) => (
          <Card key={s.id} className="p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#0EA5E920] text-primary">
                  <Truck size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold leading-tight">{s.name}</h3>
                  <div className="text-xs text-muted-foreground">{s.code} · {s.city ?? "—"}</div>
                </div>
              </div>
              {s.balance > 0 ? (
                <Badge variant="warning">{fmtMoney(s.balance)} dû</Badge>
              ) : (
                <Badge variant="success">À jour</Badge>
              )}
            </div>

            {s.contact ? (
              <div className="mb-3 text-sm">
                Contact : <strong>{s.contact}</strong>
              </div>
            ) : null}

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone size={12} />
                <span>{s.phone}</span>
              </div>
              {s.email ? (
                <div className="flex items-center gap-2">
                  <Mail size={12} />
                  <span>{s.email}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-xs">
              <div>
                <div className="text-muted-foreground">Lots reçus</div>
                <div className="font-mono text-lg font-bold">{s._count.lots}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Commandes</div>
                <div className="font-mono text-lg font-bold">{s._count.purchaseOrders}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-dashed bg-muted/30 p-4 text-xs text-muted-foreground">
        <strong>Note :</strong> la création de bons de commande, la réception multi-lignes et la
        génération automatique des lots seront ajoutées dans une itération ultérieure.
      </Card>
    </div>
  );
}
