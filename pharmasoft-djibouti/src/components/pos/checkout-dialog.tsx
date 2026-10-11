"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Role } from "@prisma/client";
import {
  Banknote,
  CreditCard,
  Smartphone,
  Wallet,
  Shield,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtMoney } from "@/lib/utils";

type Method = "CASH" | "CARD" | "DMONEY" | "WAAFI" | "INSURANCE" | "CREDIT";

const METHODS: { id: Method; label: string; icon: typeof Banknote; color: string }[] = [
  { id: "CASH", label: "Espèces", icon: Banknote, color: "#10B981" },
  { id: "CARD", label: "Carte", icon: CreditCard, color: "#0EA5E9" },
  { id: "DMONEY", label: "D-Money", icon: Smartphone, color: "#F59E0B" },
  { id: "WAAFI", label: "Waafi", icon: Wallet, color: "#8B5CF6" },
  { id: "CREDIT", label: "Crédit", icon: Clock, color: "#64748B" },
];

interface CartLine {
  medicineId: string;
  qty: number;
  requiresPrescription: boolean;
}

interface ClientInfo {
  id: string;
  name: string;
  points: number;
  insuranceName?: string | null;
  coverageRate?: number | null;
}

interface PaymentRow {
  method: Method;
  amount: number;
}

// PHARMASOFT — Dialog d'encaissement complet.
// Gère tiers-payant, fidélité dépensable, paiements multiples et rendu de monnaie.
export function CheckoutDialog({
  open,
  onOpenChange,
  total,
  cart,
  client,
  discountPercent,
  role,
  locale,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  total: number;
  cart: CartLine[];
  client: ClientInfo | null;
  discountPercent: number;
  role: Role;
  locale: string;
}) {
  const router = useRouter();
  const [useInsurance, setUseInsurance] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [payments, setPayments] = useState<PaymentRow[]>([{ method: "CASH", amount: 0 }]);
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cartHasRx = cart.some((l) => l.requiresPrescription);
  const needsPin = cartHasRx && role !== "TITULAIRE";
  const canInsure = !!client?.insuranceName && (client?.coverageRate ?? 0) > 0;

  // Reste à charge client après tiers-payant + fidélité (sur le total déjà calculé côté POS,
  // le service recalcule la part assurance exacte ; ici on estime pour l'affichage).
  const estimate = useMemo(() => {
    const afterPoints = Math.max(0, total - pointsToRedeem);
    const insuranceCovered = useInsurance && canInsure ? Math.round((afterPoints * (client!.coverageRate ?? 0)) / 100) : 0;
    const clientDue = afterPoints - insuranceCovered;
    return { afterPoints, insuranceCovered, clientDue };
  }, [total, pointsToRedeem, useInsurance, canInsure, client]);

  const amountPaid = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const cashPaid = payments.filter((p) => p.method === "CASH").reduce((s, p) => s + (p.amount || 0), 0);
  const usesCredit = payments.some((p) => p.method === "CREDIT");
  const remaining = estimate.clientDue - amountPaid;
  const change = Math.min(Math.max(0, amountPaid - estimate.clientDue), cashPaid);

  function setAmount(idx: number, amount: number) {
    setPayments((prev) => prev.map((p, i) => (i === idx ? { ...p, amount } : p)));
  }
  function setMethod(idx: number, method: Method) {
    setPayments((prev) => prev.map((p, i) => (i === idx ? { ...p, method } : p)));
  }
  function addRow() {
    setPayments((prev) => [...prev, { method: "CARD", amount: Math.max(0, remaining) }]);
  }
  function removeRow(idx: number) {
    setPayments((prev) => prev.filter((_, i) => i !== idx));
  }
  function fillExact() {
    setPayments([{ method: payments[0]?.method ?? "CASH", amount: estimate.clientDue }]);
  }

  async function confirm() {
    if (!usesCredit && amountPaid < estimate.clientDue) {
      toast.error("Montant payé insuffisant");
      return;
    }
    if (needsPin && pin.length !== 4) {
      toast.error("PIN pharmacien requis (4 chiffres)");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        lines: cart.map((l) => ({ medicineId: l.medicineId, quantity: l.qty })),
        clientId: client?.id ?? null,
        payments: payments.filter((p) => p.amount > 0).map((p) => ({ method: p.method, amount: p.amount })),
        useInsurance: useInsurance && canInsure,
        discountPercent,
        pointsToRedeem,
        validationPin: needsPin ? pin : undefined,
      };
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("PIN incorrect");
        } else {
          throw new Error(json.error ?? "Échec de la vente");
        }
        setSubmitting(false);
        return;
      }
      toast.success(`Vente encaissée — ${json.ticketNumber}${change > 0 ? ` · Monnaie : ${fmtMoney(change)}` : ""}`);
      router.push(`/${locale}/ticket/${json.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#22C55E]" />
            Encaissement
          </DialogTitle>
        </DialogHeader>

        {/* Récapitulatif */}
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-mono font-semibold">{fmtMoney(total)}</span></div>
          {pointsToRedeem > 0 ? (
            <div className="flex justify-between text-[#F59E0B]"><span>Fidélité</span><span className="font-mono">−{fmtMoney(pointsToRedeem)}</span></div>
          ) : null}
          {estimate.insuranceCovered > 0 ? (
            <div className="flex justify-between text-primary"><span>Part assurance ({client?.coverageRate}%)</span><span className="font-mono">−{fmtMoney(estimate.insuranceCovered)}</span></div>
          ) : null}
          <div className="mt-1.5 flex justify-between border-t pt-1.5 text-base font-bold"><span>Reste à payer client</span><span className="font-mono">{fmtMoney(estimate.clientDue)}</span></div>
        </div>

        {/* Tiers-payant + fidélité */}
        {client ? (
          <div className="flex flex-wrap gap-2">
            {canInsure ? (
              <button
                onClick={() => setUseInsurance((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${useInsurance ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
              >
                <Shield size={14} /> Tiers-payant {client.insuranceName}
              </button>
            ) : null}
            {client.points > 0 ? (
              <div className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm">
                <Star size={14} className="text-[#F59E0B]" />
                <span>Points ({client.points})</span>
                <Input
                  type="number"
                  min={0}
                  max={Math.min(client.points, estimate.afterPoints)}
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(Math.max(0, Math.min(Number(e.target.value), client.points, total)))}
                  className="h-7 w-20"
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Paiements */}
        <div className="space-y-2">
          {payments.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select value={p.method} onChange={(e) => setMethod(idx, e.target.value as Method)} className="h-9 w-36 rounded-md border border-input bg-card px-2 text-sm">
                {METHODS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <Input type="number" min={0} value={p.amount || ""} onChange={(e) => setAmount(idx, Number(e.target.value))} placeholder="Montant" className="h-9 flex-1 font-mono" />
              {payments.length > 1 ? (
                <button onClick={() => removeRow(idx)} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted"><Trash2 size={14} /></button>
              ) : null}
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={addRow}><Plus size={14} /> Paiement mixte</Button>
            <Button type="button" variant="ghost" size="sm" onClick={fillExact}>Montant exact</Button>
          </div>
        </div>

        {/* Monnaie / reste */}
        <div className="rounded-lg border p-3 text-sm">
          {remaining > 0 && !usesCredit ? (
            <div className="flex justify-between text-[#EF4444]"><span>Reste à payer</span><span className="font-mono font-bold">{fmtMoney(remaining)}</span></div>
          ) : change > 0 ? (
            <div className="flex justify-between text-[#22C55E]"><span>Monnaie à rendre</span><span className="font-mono font-bold">{fmtMoney(change)}</span></div>
          ) : usesCredit && remaining > 0 ? (
            <div className="flex justify-between text-muted-foreground"><span>Porté au crédit client</span><span className="font-mono">{fmtMoney(remaining)}</span></div>
          ) : (
            <div className="flex justify-between text-[#22C55E]"><span>Compte juste</span><span className="font-mono font-bold">✓</span></div>
          )}
        </div>

        {/* PIN si Rx */}
        {needsPin ? (
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-sm text-[#92400E]">
              <Lock size={14} /> Validation pharmacien requise (ordonnance)
            </div>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="PIN Titulaire ••••"
              className="h-11 text-center font-mono text-lg tracking-[0.5em]"
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button variant="success" onClick={confirm} disabled={submitting}>
            <CheckCircle2 size={16} /> {submitting ? "Encaissement…" : `Valider ${fmtMoney(estimate.clientDue)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
