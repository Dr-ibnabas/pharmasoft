"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save, Wrench } from "lucide-react";
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
import { stockAdjustSchema, type StockAdjustInput } from "@/lib/validations/lot";

interface Props {
  lotId: string;
  lotNumber: string;
  currentQuantity: number;
  medicineName: string;
  trigger: React.ReactNode;
}

// PHARMASOFT — Dialog d'ajustement de stock pour un lot.
// Le delta peut être négatif (perte/casse/péremption).
export function StockAdjustDialog({ lotId, lotNumber, currentQuantity, medicineName, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<StockAdjustInput>({
    resolver: zodResolver(stockAdjustSchema),
    defaultValues: { lotId, delta: 0, reason: "", type: "ADJUST_PLUS" },
  });

  async function onSubmit(values: StockAdjustInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/stock/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Échec de l'ajustement");
      }
      toast.success(`Stock ajusté (lot ${lotNumber})`);
      setOpen(false);
      reset();
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench size={18} className="text-primary" />
            Ajuster le stock
          </DialogTitle>
          <DialogDescription>
            {medicineName} — lot <strong>{lotNumber}</strong> ({currentQuantity} u. actuelles)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("lotId")} />

          <div>
            <Label className="mb-1.5 block">Type d'ajustement</Label>
            <select
              {...register("type")}
              className="h-[38px] w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="ADJUST_PLUS">Ajustement inventaire (+)</option>
              <option value="ADJUST_MINUS">Ajustement inventaire (−)</option>
              <option value="OUT_LOSS">Perte / casse</option>
              <option value="OUT_EXPIRY">Périmé (à retirer)</option>
              <option value="RETURN_SUPPLIER">Retour fournisseur</option>
            </select>
          </div>

          <div>
            <Label className="mb-1.5 block">Delta (négatif pour retirer)</Label>
            <Input type="number" {...register("delta", { valueAsNumber: true })} />
            {errors.delta ? <p className="mt-1 text-xs text-[#EF4444]">{errors.delta.message}</p> : null}
          </div>

          <div>
            <Label className="mb-1.5 block">Motif (audit)</Label>
            <Input placeholder="Ex : Recompte inventaire, casse au stockage…" {...register("reason")} />
            {errors.reason ? <p className="mt-1 text-xs text-[#EF4444]">{errors.reason.message}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              <Save size={14} /> {submitting ? "Enregistrement…" : "Valider"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
