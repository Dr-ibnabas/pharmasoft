"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Undo2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtMoney } from "@/lib/utils";

interface SaleLineOpt {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

const REASONS: { id: string; label: string }[] = [
  { id: "CLIENT_RETURN", label: "Retour client" },
  { id: "ERROR", label: "Erreur de caisse" },
  { id: "DEFECT", label: "Produit défectueux" },
  { id: "EXPIRED", label: "Produit périmé" },
  { id: "OTHER", label: "Autre" },
];

// PHARMASOFT — Dialog de retour / avoir sur une vente.
export function RefundDialog({
  saleId,
  ticketNumber,
  lines,
  trigger,
}: {
  saleId: string;
  ticketNumber: string;
  lines: SaleLineOpt[];
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("CLIENT_RETURN");
  const [restock, setRestock] = useState(true);
  const [qty, setQty] = useState<Record<string, number>>(() => Object.fromEntries(lines.map((l) => [l.id, 0])));

  const total = lines.reduce((s, l) => s + (qty[l.id] ?? 0) * l.unitPrice, 0);

  async function submit() {
    const refundLines = Object.entries(qty)
      .filter(([, q]) => q > 0)
      .map(([saleLineId, q]) => ({ saleLineId, quantity: q }));
    if (refundLines.length === 0) return toast.error("Sélectionnez au moins un article");

    setSubmitting(true);
    try {
      const res = await fetch(`/api/sales/${saleId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, restock, lines: refundLines }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Échec");
      }
      toast.success(`Avoir créé — ${fmtMoney(total)} remboursé`);
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Undo2 size={18} className="text-primary" />
            Retour / Avoir — {ticketNumber}
          </DialogTitle>
          <DialogDescription>Sélectionnez les articles et quantités à retourner.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {lines.map((l) => (
            <div key={l.id} className="flex items-center gap-3 rounded-md border p-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{l.name}</div>
                <div className="text-xs text-muted-foreground">Vendu : {l.quantity} × {fmtMoney(l.unitPrice)}</div>
              </div>
              <Input
                type="number"
                min={0}
                max={l.quantity}
                value={qty[l.id] ?? 0}
                onChange={(e) => setQty((p) => ({ ...p, [l.id]: Math.min(Number(e.target.value), l.quantity) }))}
                className="h-9 w-20"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Motif</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="h-9 w-full rounded-md border border-input bg-card px-2 text-sm">
              {REASONS.map((r) => (<option key={r.id} value={r.id}>{r.label}</option>))}
            </select>
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} className="h-4 w-4" />
            Remettre en stock
          </label>
        </div>

        <div className="rounded-md bg-muted/40 p-3 text-sm">
          <div className="flex justify-between font-semibold">
            <span>Montant à rembourser</span>
            <span className="font-mono">{fmtMoney(total)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={submit} disabled={submitting || total === 0}>
            <Save size={14} /> {submitting ? "Traitement…" : "Valider le retour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
