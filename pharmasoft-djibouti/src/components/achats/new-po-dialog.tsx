"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShoppingBag, Plus, Trash2, Save } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { fmtMoney } from "@/lib/utils";

interface SupplierOpt {
  id: string;
  name: string;
}
interface MedOpt {
  id: string;
  name: string;
  code: string;
  purchasePrice: number;
}
interface Line {
  medicineId: string;
  quantity: number;
  unitPrice: number;
}

// PHARMASOFT — Dialog de création d'un bon de commande fournisseur (multi-lignes).
export function NewPurchaseOrderDialog({
  suppliers,
  medicines,
  trigger,
}: {
  suppliers: SupplierOpt[];
  medicines: MedOpt[];
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [expectedAt, setExpectedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([{ medicineId: medicines[0]?.id ?? "", quantity: 1, unitPrice: medicines[0]?.purchasePrice ?? 0 }]);

  const total = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  function updateLine(idx: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((prev) => [...prev, { medicineId: medicines[0]?.id ?? "", quantity: 1, unitPrice: medicines[0]?.purchasePrice ?? 0 }]);
  }
  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }
  function onMedChange(idx: number, medicineId: string) {
    const med = medicines.find((m) => m.id === medicineId);
    updateLine(idx, { medicineId, unitPrice: med?.purchasePrice ?? 0 });
  }

  async function submit() {
    if (!supplierId) return toast.error("Choisissez un fournisseur");
    if (lines.length === 0) return toast.error("Ajoutez au moins une ligne");
    setSubmitting(true);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId, expectedAt: expectedAt || null, notes: notes || null, items: lines }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Échec");
      }
      const po = await res.json();
      toast.success(`Commande ${po.code} créée`);
      setOpen(false);
      setLines([{ medicineId: medicines[0]?.id ?? "", quantity: 1, unitPrice: medicines[0]?.purchasePrice ?? 0 }]);
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary" />
            Nouveau bon de commande
          </DialogTitle>
          <DialogDescription>Commandez des produits à un fournisseur. À la réception, les lots seront créés automatiquement.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block">Fournisseur</Label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="h-[38px] w-full rounded-md border border-input bg-card px-3 text-sm">
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-1.5 block">Livraison attendue (optionnel)</Label>
            <Input type="date" value={expectedAt} onChange={(e) => setExpectedAt(e.target.value)} />
          </div>
        </div>

        {/* Lignes */}
        <div className="mt-2 rounded-lg border">
          <div className="grid grid-cols-[1fr_80px_110px_110px_36px] gap-2 border-b bg-muted/60 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Produit</span><span>Qté</span><span>PA unit.</span><span>Total</span><span />
          </div>
          <div className="max-h-[260px] overflow-y-auto">
            {lines.map((l, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_80px_110px_110px_36px] items-center gap-2 border-b px-3 py-2 last:border-0">
                <select value={l.medicineId} onChange={(e) => onMedChange(idx, e.target.value)} className="h-9 w-full rounded-md border border-input bg-card px-2 text-sm">
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                  ))}
                </select>
                <Input type="number" min={1} value={l.quantity} onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })} className="h-9" />
                <Input type="number" min={0} value={l.unitPrice} onChange={(e) => updateLine(idx, { unitPrice: Number(e.target.value) })} className="h-9 font-mono" />
                <span className="font-mono text-sm">{fmtMoney(l.quantity * l.unitPrice, false)}</span>
                <button onClick={() => removeLine(idx)} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted" disabled={lines.length === 1}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-3 py-2">
            <Button type="button" variant="ghost" size="sm" onClick={addLine}>
              <Plus size={14} /> Ajouter une ligne
            </Button>
            <div className="text-sm">
              Total : <strong className="font-mono">{fmtMoney(total)}</strong>
            </div>
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block">Notes (optionnel)</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Conditions, urgence…" />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={submit} disabled={submitting}>
            <Save size={14} /> {submitting ? "Création…" : "Créer la commande"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
