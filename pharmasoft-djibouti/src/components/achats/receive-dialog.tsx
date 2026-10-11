"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PackageCheck, Save } from "lucide-react";
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

interface ItemToReceive {
  id: string;
  medicineName: string;
  ordered: number;
  alreadyReceived: number;
}

interface LineState {
  receivedQty: number;
  lotNumber: string;
  expiryDate: string;
}

// PHARMASOFT — Dialog de réception de marchandise.
// Pour chaque ligne restante, on saisit la quantité reçue, le n° de lot et la péremption.
export function ReceiveDialog({
  poId,
  poCode,
  items,
  trigger,
}: {
  poId: string;
  poCode: string;
  items: ItemToReceive[];
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const remaining = items.filter((i) => i.ordered - i.alreadyReceived > 0);

  const [state, setState] = useState<Record<string, LineState>>(() =>
    Object.fromEntries(
      remaining.map((i) => [
        i.id,
        { receivedQty: i.ordered - i.alreadyReceived, lotNumber: "", expiryDate: "" },
      ]),
    ),
  );

  function patch(id: string, p: Partial<LineState>) {
    setState((prev) => ({ ...prev, [id]: { ...prev[id]!, ...p } }));
  }

  async function submit() {
    const lines = Object.entries(state)
      .filter(([, s]) => s.receivedQty > 0)
      .map(([itemId, s]) => ({ itemId, receivedQty: s.receivedQty, lotNumber: s.lotNumber, expiryDate: s.expiryDate }));

    if (lines.length === 0) return toast.error("Rien à réceptionner");
    for (const l of lines) {
      if (!l.lotNumber.trim()) return toast.error("N° de lot obligatoire pour chaque ligne reçue");
      if (!l.expiryDate) return toast.error("Date de péremption obligatoire");
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/purchase-orders/${poId}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Échec");
      }
      toast.success("Marchandise réceptionnée — stock mis à jour");
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck size={18} className="text-primary" />
            Réception — {poCode}
          </DialogTitle>
          <DialogDescription>
            Saisissez les quantités reçues, le numéro de lot et la date de péremption. Les lots seront créés et le stock incrémenté.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {remaining.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Tout a déjà été réceptionné.</p>
          ) : (
            remaining.map((i) => {
              const s = state[i.id]!;
              const toReceive = i.ordered - i.alreadyReceived;
              return (
                <div key={i.id} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{i.medicineName}</span>
                    <span className="text-xs text-muted-foreground">Reste à recevoir : {toReceive}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] text-muted-foreground">Qté reçue</label>
                      <Input type="number" min={0} max={toReceive} value={s.receivedQty} onChange={(e) => patch(i.id, { receivedQty: Number(e.target.value) })} className="h-9" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] text-muted-foreground">N° lot</label>
                      <Input value={s.lotNumber} onChange={(e) => patch(i.id, { lotNumber: e.target.value })} placeholder="LOT-..." className="h-9" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] text-muted-foreground">Péremption</label>
                      <Input type="date" value={s.expiryDate} onChange={(e) => patch(i.id, { expiryDate: e.target.value })} className="h-9" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={submit} disabled={submitting || remaining.length === 0}>
            <Save size={14} /> {submitting ? "Réception…" : "Valider la réception"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
