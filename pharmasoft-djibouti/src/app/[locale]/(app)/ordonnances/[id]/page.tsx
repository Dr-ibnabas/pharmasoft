import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, AlertCircle, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { ValidatePinDialog } from "@/components/ordonnances/validate-pin-dialog";
import { fmtDate, fmtDateTime } from "@/lib/utils";

interface PageProps {
  params: { locale: string; id: string };
}

const STATUS_META: Record<string, { variant: "warning" | "primary" | "success" | "neutral"; label: string }> = {
  PENDING: { variant: "warning", label: "En attente" },
  PARTIAL: { variant: "primary", label: "Partielle" },
  FULFILLED: { variant: "success", label: "Servie" },
  EXPIRED: { variant: "neutral", label: "Expirée" },
  CANCELLED: { variant: "neutral", label: "Annulée" },
};

export default async function PrescriptionDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) return null;

  const prescription = await prisma.prescription.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      validator: { select: { name: true, role: true } },
      items: { include: { medicine: { select: { name: true, dci: true, dosage: true, requiresPrescription: true } } } },
    },
  });
  if (!prescription) notFound();

  const meta = STATUS_META[prescription.status] ?? STATUS_META["PENDING"]!;
  const totalQty = prescription.items.reduce((s, i) => s + i.quantity, 0);
  const dispensedQty = prescription.items.reduce((s, i) => s + i.dispensedQty, 0);
  const dispensedPct = totalQty > 0 ? Math.round((dispensedQty / totalQty) * 100) : 0;
  const canValidate = prescription.status === "PENDING";

  return (
    <div>
      <Link
        href={`/${params.locale}/ordonnances`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> Toutes les ordonnances
      </Link>

      <PageHeader
        title={<span className="font-mono">{prescription.code}</span>}
        description={`Prescrite le ${fmtDate(prescription.issuedDate)} par ${prescription.doctorName}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={meta.variant}>{meta.label}</Badge>
            {canValidate ? (
              <ValidatePinDialog
                prescriptionId={prescription.id}
                prescriptionCode={prescription.code}
                clientName={prescription.client.name}
                trigger={
                  <Button>
                    <ShieldCheck size={14} /> Valider (PIN pharmacien)
                  </Button>
                }
              />
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        {/* Patient + médecin */}
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h4 className="t-h4 mb-3">Patient</h4>
            <Link
              href={`/${params.locale}/clients/${prescription.client.id}`}
              className="hover:underline"
            >
              <div className="font-semibold">{prescription.client.name}</div>
            </Link>
            <div className="mt-1 text-sm text-muted-foreground">{prescription.client.phone}</div>
            {prescription.client.allergies.length > 0 ? (
              <div className="mt-3">
                <div className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-[#EF4444]">
                  <AlertCircle size={12} />
                  Allergies déclarées
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {prescription.client.allergies.map((a) => (
                    <Badge key={a} variant="destructive" className="text-[10px]">
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            {prescription.client.conditions.length > 0 ? (
              <div className="mt-3">
                <div className="mb-1.5 text-xs font-semibold text-muted-foreground">
                  Conditions chroniques
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {prescription.client.conditions.map((c) => (
                    <Badge key={c} variant="warning" className="text-[10px]">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>

          <Card className="p-5">
            <h4 className="t-h4 mb-3">Médecin prescripteur</h4>
            <div className="font-semibold">{prescription.doctorName}</div>
            {prescription.doctorContact ? (
              <div className="mt-1 text-sm text-muted-foreground">{prescription.doctorContact}</div>
            ) : null}
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date émission</span>
                <span>{fmtDate(prescription.issuedDate)}</span>
              </div>
              {prescription.expiresAt ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expire le</span>
                  <span>{fmtDate(prescription.expiresAt)}</span>
                </div>
              ) : null}
            </div>
          </Card>

          {prescription.validator ? (
            <Card className="border-[#22C55E]/30 bg-[#DCFCE7]/30 p-5">
              <div className="mb-2 flex items-center gap-2 text-[#22C55E]">
                <ShieldCheck size={16} />
                <span className="text-sm font-semibold">Validée par pharmacien</span>
              </div>
              <div className="text-sm">
                <strong>{prescription.validator.name}</strong>{" "}
                <span className="text-muted-foreground">
                  ({prescription.validator.role.toLowerCase()})
                </span>
              </div>
              {prescription.validatedAt ? (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Le {fmtDateTime(prescription.validatedAt)}
                </div>
              ) : null}
            </Card>
          ) : null}
        </div>

        {/* Items */}
        <Card className="p-0">
          <div className="border-b p-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="t-h4 m-0 flex items-center gap-2">
                  <FileText size={16} className="text-muted-foreground" />
                  Médicaments prescrits
                </h4>
                <p className="t-muted text-sm">{prescription.items.length} ligne(s)</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold tabular-nums">{dispensedPct}%</div>
                <div className="text-xs text-muted-foreground">délivré</div>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all ${
                  dispensedPct >= 100 ? "bg-[#22C55E]" : "bg-primary"
                }`}
                style={{ width: `${dispensedPct}%` }}
              />
            </div>
          </div>

          <div className="divide-y">
            {prescription.items.map((i) => {
              const remaining = i.quantity - i.dispensedQty;
              return (
                <div key={i.id} className="flex items-start gap-4 p-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted">
                    <FileText size={16} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{i.medicine.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {i.medicine.dci} · {i.medicine.dosage}
                    </div>
                    {i.posology ? (
                      <div className="mt-1.5 text-xs">
                        <strong>Posologie :</strong> {i.posology}
                        {i.duration ? <span className="ms-2 text-muted-foreground">({i.duration})</span> : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold">
                      {i.dispensedQty} / {i.quantity}
                    </div>
                    {remaining > 0 ? (
                      <Badge variant="warning" className="mt-1 text-[10px]">
                        Reste {remaining}
                      </Badge>
                    ) : (
                      <Badge variant="success" className="mt-1 text-[10px]">
                        Complet
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {prescription.notes ? (
            <div className="border-t bg-muted/30 p-4 text-sm">
              <div className="mb-1 text-xs font-semibold text-muted-foreground">Notes</div>
              {prescription.notes}
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
