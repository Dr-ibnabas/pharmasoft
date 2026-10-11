"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, Lock } from "lucide-react";
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

interface Props {
  prescriptionId: string;
  prescriptionCode: string;
  clientName: string;
  trigger: React.ReactNode;
}

// PHARMASOFT — Modal de validation pharmacien (D-014).
// Demande le PIN à 4 chiffres du Titulaire. 3 échecs → ferme + warning.
export function ValidatePinDialog({ prescriptionId, prescriptionCode, clientName, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);

  async function handleSubmit() {
    if (!/^\d{4}$/.test(pin)) {
      toast.error("Le PIN doit comporter 4 chiffres");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/prescriptions/${prescriptionId}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const next = attempts + 1;
        setAttempts(next);
        if (next >= 3) {
          toast.error("Trop de tentatives échouées. Demandez de l'aide au titulaire.");
          setOpen(false);
          setPin("");
          setAttempts(0);
          return;
        }
        throw new Error(err.error ?? "PIN incorrect");
      }
      toast.success("Ordonnance validée par le pharmacien");
      setOpen(false);
      setPin("");
      setAttempts(0);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setPin("");
          setAttempts(0);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            Validation pharmacien requise
          </DialogTitle>
          <DialogDescription>
            L'ordonnance <strong className="font-mono">{prescriptionCode}</strong> ({clientName}) contient
            au moins un médicament sous prescription. Saisissez le <strong>PIN du pharmacien titulaire</strong>{" "}
            pour autoriser la délivrance.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2">
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              className="h-12 pl-10 text-center font-mono text-xl tracking-[0.5em]"
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSubmit();
              }}
            />
          </div>
          {attempts > 0 ? (
            <p className="mt-2 text-center text-xs text-[#EF4444]">
              {attempts} tentative{attempts > 1 ? "s" : ""} échouée{attempts > 1 ? "s" : ""} sur 3.
            </p>
          ) : (
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              PIN par défaut au seed : 1234 — à changer en production.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || pin.length !== 4}>
            {submitting ? "Vérification…" : "Valider"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
