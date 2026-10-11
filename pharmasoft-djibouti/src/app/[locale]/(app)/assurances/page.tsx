import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/page-header";
import { Shield } from "lucide-react";
import { fmtMoney } from "@/lib/utils";

export default async function AssurancesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const insurances = await prisma.insurance.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { members: true, claims: true } },
    },
    orderBy: { name: "asc" },
  });

  // Total des claims PENDING par assureur
  const claimsByInsurance = await prisma.insuranceClaim.groupBy({
    by: ["insuranceId", "status"],
    _sum: { amountClaimed: true },
  });

  const pendingByInsurance = new Map<string, number>();
  for (const c of claimsByInsurance) {
    if (c.status === "PENDING") {
      pendingByInsurance.set(c.insuranceId, c._sum.amountClaimed ?? 0);
    }
  }

  const totalPending = Array.from(pendingByInsurance.values()).reduce((s, v) => s + v, 0);

  return (
    <div>
      <PageHeader
        title="Assurances & mutuelles"
        description={`${insurances.length} assureurs partenaires · ${fmtMoney(totalPending)} en attente de bordereau`}
      />

      <div className="grid gap-3 lg:grid-cols-3">
        {insurances.map((ins) => {
          const pending = pendingByInsurance.get(ins.id) ?? 0;
          return (
            <Card key={ins.id} className="p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#8B5CF620] text-[#8B5CF6]">
                    <Shield size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold leading-tight">{ins.name}</h3>
                    <div className="text-xs text-muted-foreground">{ins.code}</div>
                  </div>
                </div>
                <Badge variant="primary">{ins.coverageRate}%</Badge>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                {ins.contactPhone ? <div>📞 {ins.contactPhone}</div> : null}
                {ins.contactEmail ? <div>✉️ {ins.contactEmail}</div> : null}
                {ins.address ? <div>📍 {ins.address}</div> : null}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Adhérents</div>
                  <div className="font-mono text-lg font-bold">{ins._count.members}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Claims totaux</div>
                  <div className="font-mono text-lg font-bold">{ins._count.claims}</div>
                </div>
              </div>

              {pending > 0 ? (
                <div className="mt-3 rounded-md bg-[#FEF3C7] p-2.5 text-center">
                  <div className="text-[11px] text-[#92400E]">En attente bordereau</div>
                  <div className="font-mono text-base font-bold text-[#92400E]">{fmtMoney(pending)}</div>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 border-dashed bg-muted/30 p-4 text-xs text-muted-foreground">
        <strong>Note :</strong> la génération mensuelle de bordereaux PDF et le workflow
        SUBMITTED → APPROVED → PAID seront ajoutés dans P7.
      </Card>
    </div>
  );
}
