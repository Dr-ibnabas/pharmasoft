"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Key, Lock } from "lucide-react";
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
import { pinChangeSchema, type PinChangeInput } from "@/lib/validations/user";

interface Props {
  targetUserId: string;
  targetUserName: string;
  /** Si true, currentPin n'est pas requis (cas SUPER_ADMIN réinitialisant). */
  isReset?: boolean;
  trigger: React.ReactNode;
}

export function PinChangeDialog({ targetUserId, targetUserName, isReset, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PinChangeInput>({
    resolver: zodResolver(pinChangeSchema),
    defaultValues: { currentPin: "", newPin: "", confirmPin: "" },
  });

  async function onSubmit(values: PinChangeInput) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${targetUserId}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Échec");
      }
      toast.success("PIN mis à jour");
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
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key size={18} className="text-primary" />
            {isReset ? "Réinitialiser le PIN" : "Changer le PIN"}
          </DialogTitle>
          <DialogDescription>
            {isReset
              ? `Définir un nouveau PIN à 4 chiffres pour ${targetUserName}.`
              : "Pour autoriser la délivrance des médicaments sur ordonnance par les vendeurs/caissiers."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {!isReset ? (
            <PinField label="PIN actuel" error={errors.currentPin?.message} {...register("currentPin")} />
          ) : null}
          <PinField label="Nouveau PIN" error={errors.newPin?.message} {...register("newPin")} />
          <PinField label="Confirmer le nouveau PIN" error={errors.confirmPin?.message} {...register("confirmPin")} />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={submitting}>
              <Lock size={14} /> {submitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const PinField = ({ label, error, ...rest }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <Label className="mb-1.5 block">{label}</Label>
    <Input
      type="password"
      inputMode="numeric"
      maxLength={4}
      placeholder="••••"
      className="h-11 text-center font-mono text-lg tracking-[0.4em]"
      {...rest}
    />
    {error ? <p className="mt-1 text-xs text-[#EF4444]">{error}</p> : null}
  </div>
);
