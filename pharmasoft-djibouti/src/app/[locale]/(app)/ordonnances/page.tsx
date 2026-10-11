import Link from "next/link";
import { FileText, AlertCircle, ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/page-header";
import { fmtDate } from "@/lib/utils";

interface SearchParams {
  status?: "PENDING" | "PARTIAL" | "FULFILLED" | "EXPIRED" | "CANCELLED";
}

const STATUS_META: Record<
  string,
  { variant: "warning" | "primary" | "success" | "neutral"; label: string }
> = {
  PENDING: { variant: "warning", label: "En attente" },
  PARTIAL: { variant: "primary", label: "Partielle" },
  FULFILLED: { variant: "success", label: "Servie" },
  EXPIRED: { variant: "neutral", label: "Expirée" },
  CANCELLED: { variant: "neutral", label: "Annulée" },
};

export default async function OrdonnancesPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const where = searchParams.status ? { status: searchParams.status } : {};

  const prescriptions = await prisma.prescription.findMany({
    where,
    include: {
      client: { select: { name: true, phone: true, allergies: true } },
      items: {
        include: {
          medicine: { select: { name: true, requiresPrescription: true } },
        },
      },
    },
    orderBy: { issuedDate: "desc" },
  });

  // Compteurs par statut pour les filtres
  const counts = await prisma.prescription.groupBy({
    by: ["status"],
    _count: true,
  });
  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count])) as Record<
    string,
    number
  >;

  const FILTERS = [
    { key: undefined, label: "Toutes", count: prescriptions.length },
    { key: "PENDING" as const, label: "En attente", count: countByStatus["PENDING"] ?? 0 },
    { key: "PARTIAL" as const, label: "Partielles", count: countByStatus["PARTIAL"] ?? 0 },
    { key: "FULFILLED" as const, label: "Servies", count: countByStatus["FULFILLED"] ?? 0 },
  ];

  return (
    <div>
      <PageHeader title="Ordonnances" description="Suivi des prescriptions et validation pharmacien" />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const href = f.key ? `/${params.locale}/ordonnances?status=${f.key}` : `/${params.locale}/ordonnances`;
          const active = searchParams.status === f.key || (!searchParams.status && !f.key);
          return (
            <Link
              key={f.label}
              href={href}
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {f.label}
              <span className={active ? "opacity-80" : "text-muted-foreground"}>{f.count}</span>
            </Link>
          );
        })}
      </div>

      {prescriptions.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          <FileText size={32} className="mx-auto mb-3 text-muted-foreground/50" />
          Aucune ordonnance ne correspond aux filtres.
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {prescriptions.map((p) => {
            const meta = STATUS_META[p.status] ?? STATUS_META["PENDING"]!;
            const totalQty = p.items.reduce((s, i) => s + i.quantity, 0);
            const dispensedQty = p.items.reduce((s, i) => s + i.dispensedQty, 0);
            const dispensedPct = totalQty > 0 ? Math.round((dispensedQty / totalQty) * 100) : 0;
            const hasRx = p.items.some((i) => i.medicine.requiresPrescription);
            const hasAllergy = p.client.allergies.length > 0;

            return (
              <Link
                key={p.id}
                href={`/${params.locale}/ordonnances/${p.id}`}
                className="group rounded-lg border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-p-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">{p.code}</span>
                      {hasRx ? (
                        <Badge variant="warning" className="text-[10px]">
                          Rx
                        </Badge>
                      ) : null}
                      {hasAllergy ? (
                        <Badge variant="destructive" className="text-[10px]">
                          <AlertCircle size={9} className="mr-0.5" />
                          Allergie
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold">{p.client.name}</div>
                    <div className="text-xs text-muted-foreground">{p.client.phone}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                    <ExternalLink
                      size={14}
                      className="text-muted-foreground transition-opacity opacity-0 group-hover:opacity-100"
                    />
                  </div>
                </div>

                <div className="mb-2 text-xs text-muted-foreground">
                  Prescrit par <strong className="text-foreground">{p.doctorName}</strong> ·{" "}
                  {fmtDate(p.issuedDate)}
                </div>

                <div className="space-y-1.5 text-xs">
                  {p.items.slice(0, 3).map((i) => (
                    <div key={i.id} className="flex justify-between">
                      <span className="truncate">{i.medicine.name}</span>
                      <span className="ms-2 font-mono text-muted-foreground">
                        {i.dispensedQty}/{i.quantity}
                      </span>
                    </div>
                  ))}
                  {p.items.length > 3 ? (
                    <div className="text-[11px] text-muted-foreground">
                      … et {p.items.length - 3} autre{p.items.length - 3 > 1 ? "s" : ""}
                    </div>
                  ) : null}
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>Délivré</span>
                    <span>{dispensedPct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all ${
                        dispensedPct >= 100
                          ? "bg-[#22C55E]"
                          : dispensedPct > 0
                            ? "bg-primary"
                            : "bg-[#F59E0B]"
                      }`}
                      style={{ width: `${dispensedPct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
