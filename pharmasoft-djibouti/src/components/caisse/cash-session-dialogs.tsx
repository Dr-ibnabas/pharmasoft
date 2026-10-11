"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Banknote, Lock, Save } from "lucide-react";
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
import { cashOpenSchema, cashCloseSchema, type CashOpenInput, type CashCloseInput } from "@/lib/validations/cash";
import { fmtMoney } from "@/lib/utils";

export function OpenSessionDialog({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CashOpenInput>({
    resolver: zodResolver(cashOpenSchema),
    defaultValues: { openingFloat: 20_000, notes: "" },
  });

  async function onSubmit(values: CashOpenInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/cash-sessions/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Échec");
      }
      toast.success("Session de caisse ouverte");
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
            <Banknote size={18} className="text-primary" />
            Ouverture de session
          </DialogTitle>
          <DialogDescription>Indiquez le montant initial du fond de caisse (espèces).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Fond de caisse (Fdj)</Label>
            <Input
              type="number"
              min={0}
              className="h-12 font-mono text-xl"
              {...register("openingFloat", { valueAsNumber: true })}
            />
            {errors.openingFloat ? <p className="mt-1 text-xs text-[#EF4444]">{errors.openingFloat.message}</p> : null}
          </div>
          <div>
            <Label className="mb-1.5 block">Notes (optionnel)</Label>
            <Input placeholder="Ex : Reliquat de la veille…" {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={submitting}>
              <Save size={14} /> {submitting ? "Enregistrement…" : "Ouvrir la session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CloseSessionDialog({
  trigger,
  sessionId,
  expectedAmount,
}: {
  trigger: React.ReactNode;
  sessionId: string;
  expectedAmount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<CashCloseInput>({
    resolver: zodResolver(cashCloseSchema),
    defaultValues: { countedAmount: expectedAmount, notes: "" },
  });
  const counted = watch("countedAmount") || 0;
  const discrepancy = expectedAmount - counted;

  async function onSubmit(values: CashCloseInput) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cash-sessions/${sessionId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Échec");
      }
      toast.success("Session clôturée");
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
            <Lock size={18} className="text-primary" />
            Clôture de session
          </DialogTitle>
          <DialogDescription>
            Comptez les espèces présentes dans la caisse et saisissez le montant réel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant théorique</span>
              <span className="font-mono font-bold">{fmtMoney(expectedAmount)}</span>
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Montant compté (Fdj)</Label>
            <Input
              type="number"
              min={0}
              className="h-12 font-mono text-xl"
              {...register("countedAmount", { valueAsNumber: true })}
            />
            {errors.countedAmount ? <p className="mt-1 text-xs text-[#EF4444]">{errors.countedAmount.message}</p> : null}
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Écart calculé</span>
              <span
                className="font-mono font-bold"
                style={{ color: discrepancy === 0 ? "#22C55E" : Math.abs(discrepancy) <= 500 ? "#F59E0B" : "#EF4444" }}
              >
                {discrepancy > 0 ? "−" : discrepancy < 0 ? "+" : ""}{fmtMoney(Math.abs(discrepancy))}
              </span>
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Notes (justification de l'écart si besoin)</Label>
            <Input placeholder="Ex : Rendu monnaie manquant…" {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" variant="destructive" disabled={submitting}>
              <Lock size={14} /> {submitting ? "Clôture…" : "Clôturer la session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
