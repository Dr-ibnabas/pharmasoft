import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Phone,
  MapPin,
  Star,
  AlertCircle,
  Heart,
  Receipt,
  FileText,
  Shield,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/common/page-header";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { colorFromString, fmtDate, fmtMoney, initials, fmtDateTime } from "@/lib/utils";

interface PageProps {
  params: { locale: string; id: string };
}

export default async function ClientDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) return null;

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      insuranceMembers: { include: { insurance: { select: { name: true, coverageRate: true } } } },
      sales: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          lines: {
            take: 3,
            include: { medicine: { select: { name: true } } },
          },
        },
      },
      prescriptions: {
        orderBy: { issuedDate: "desc" },
        take: 5,
        select: {
          id: true,
          code: true,
          doctorName: true,
          issuedDate: true,
          status: true,
        },
      },
    },
  });

  if (!client || client.deletedAt) notFound();

  const tierProgress: Record<string, { next: string | null; target: number; threshold: number }> = {
    BRONZE: { next: "ARGENT", target: 25000, threshold: 25000 },
    ARGENT: { next: "OR", target: 50000, threshold: 50000 },
    OR: { next: "PLATINE", target: 150000, threshold: 150000 },
    PLATINE: { next: null, target: 0, threshold: 0 },
  };
  const tp = tierProgress[client.tier] ?? tierProgress["BRONZE"]!;
  const progressPct = tp.next
    ? Math.min(100, Math.round((client.totalSpent / tp.threshold) * 100))
    : 100;

  return (
    <div>
      <Link
        href={`/${params.locale}/clients`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> Tous les clients
      </Link>

      <PageHeader
        title={client.name}
        description={`${client.code} · ${client.quarter ?? "Quartier non renseigné"}`}
        actions={
          <ClientFormDialog
            mode="edit"
            initial={{
              id: client.id,
              name: client.name,
              phone: client.phone,
              email: client.email,
              gender: client.gender as "M" | "F" | undefined,
              quarter: client.quarter,
              tier: client.tier,
              allergies: client.allergies,
              conditions: client.conditions,
            }}
            trigger={
              <Button variant="outline">
                <Edit size={14} /> Modifier
              </Button>
            }
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        {/* Profil */}
        <div className="flex flex-col gap-4">
          <Card className="p-6">
            <div className="mb-4 flex flex-col items-center text-center">
              <Avatar
                className="h-20 w-20 text-2xl"
                style={{ background: colorFromString(client.name) }}
              >
                <AvatarFallback
                  style={{ background: colorFromString(client.name) }}
                  className="text-2xl"
                >
                  {initials(client.name)}
                </AvatarFallback>
              </Avatar>
              <h3 className="t-h3 mt-3">{client.name}</h3>
              <Badge
                variant={client.tier === "PLATINE" ? "primary" : client.tier === "OR" ? "warning" : "neutral"}
                className="mt-2"
              >
                {client.tier}
              </Badge>
            </div>

            <div className="space-y-2.5 text-sm">
              <Row icon={Phone} label={client.phone} />
              {client.quarter ? <Row icon={MapPin} label={client.quarter} /> : null}
              {client.email ? <Row icon={() => <span>@</span>} label={client.email} /> : null}
              {client.dateOfBirth ? (
                <Row
                  icon={() => <span>🎂</span>}
                  label={`Né(e) le ${fmtDate(client.dateOfBirth!)}`}
                />
              ) : null}
            </div>
          </Card>

          {/* Fidélité */}
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Star size={16} className="text-[#F59E0B]" />
              <h4 className="t-h4 m-0">Fidélité</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-xs text-muted-foreground">Points</div>
                <div className="font-mono text-xl font-bold">{client.points}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Cumul</div>
                <div className="font-mono text-xl font-bold">{fmtMoney(client.totalSpent)}</div>
              </div>
            </div>
            {tp.next ? (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>Progression vers {tp.next}</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            ) : (
              <div className="mt-3 text-center text-xs text-muted-foreground">
                Tier maximum atteint 🏆
              </div>
            )}
          </Card>

          {/* Allergies / Conditions */}
          {(client.allergies.length > 0 || client.conditions.length > 0) ? (
            <Card className="p-5">
              {client.allergies.length > 0 ? (
                <div className="mb-3">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertCircle size={14} className="text-[#EF4444]" />
                    <h4 className="text-sm font-semibold">Allergies</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {client.allergies.map((a) => (
                      <Badge key={a} variant="destructive" className="text-[11px]">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              {client.conditions.length > 0 ? (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Heart size={14} className="text-[#F59E0B]" />
                    <h4 className="text-sm font-semibold">Conditions chroniques</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {client.conditions.map((c) => (
                      <Badge key={c} variant="warning" className="text-[11px]">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>
          ) : null}

          {/* Assurances */}
          {client.insuranceMembers.length > 0 ? (
            <Card className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Shield size={14} className="text-primary" />
                <h4 className="text-sm font-semibold">Couverture(s)</h4>
              </div>
              {client.insuranceMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between border-t py-2 first:border-t-0">
                  <div>
                    <div className="text-sm font-medium">{m.insurance.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{m.memberNumber}</div>
                  </div>
                  <Badge variant="primary">{m.insurance.coverageRate}%</Badge>
                </div>
              ))}
            </Card>
          ) : null}
        </div>

        {/* Historique */}
        <div className="flex flex-col gap-4">
          {/* Ventes récentes */}
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="t-h4 m-0">Dernières ventes</h4>
              <Badge variant="neutral">{client.sales.length} affichées</Badge>
            </div>
            {client.sales.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucune vente pour ce client.
              </p>
            ) : (
              <div className="divide-y">
                {client.sales.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-2.5">
                    <Receipt size={16} className="text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{s.ticketNumber}</span>
                        <span className="text-xs text-muted-foreground">· {fmtDateTime(s.createdAt)}</span>
                      </div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">
                        {s.lines.map((l) => `${l.medicine.name} ×${l.quantity}`).join(", ")}
                      </div>
                    </div>
                    <div className="font-mono text-sm font-semibold">{fmtMoney(s.total)}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Ordonnances */}
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="t-h4 m-0">Ordonnances</h4>
              <Badge variant="neutral">{client.prescriptions.length}</Badge>
            </div>
            {client.prescriptions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Aucune ordonnance enregistrée.</p>
            ) : (
              <div className="divide-y">
                {client.prescriptions.map((p) => (
                  <Link
                    key={p.id}
                    href={`/${params.locale}/ordonnances/${p.id}`}
                    className="flex items-center gap-3 py-2.5 hover:bg-muted/40"
                  >
                    <FileText size={16} className="text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-sm font-semibold">{p.code}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.doctorName} · {fmtDate(p.issuedDate)}
                      </div>
                    </div>
                    <PrescriptionStatusBadge status={p.status} />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number | string; className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon size={14} className="shrink-0 text-muted-foreground" />
      <span className="truncate text-foreground">{label}</span>
    </div>
  );
}

function PrescriptionStatusBadge({ status }: { status: string }) {
  const map = {
    PENDING: { v: "warning", l: "En attente" },
    PARTIAL: { v: "primary", l: "Partielle" },
    FULFILLED: { v: "success", l: "Servie" },
    EXPIRED: { v: "neutral", l: "Expirée" },
    CANCELLED: { v: "neutral", l: "Annulée" },
  } as const;
  const cfg = map[status as keyof typeof map] ?? { v: "neutral" as const, l: status };
  return <Badge variant={cfg.v}>{cfg.l}</Badge>;
}
