"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserPlus, Save } from "lucide-react";
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
import { userCreateSchema, ROLES, type UserCreateInput } from "@/lib/validations/user";

export function UserCreateDialog({ canCreateAdmin, trigger }: { canCreateAdmin: boolean; trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserCreateInput>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      email: "", name: "", password: "", role: "VENDEUR", locale: "FR",
    },
  });

  async function onSubmit(values: UserCreateInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Échec");
      }
      toast.success("Utilisateur créé");
      setOpen(false);
      reset();
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  const availableRoles = canCreateAdmin ? ROLES : ROLES.filter((r) => r === "VENDEUR" || r === "CAISSIER");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={18} className="text-primary" />
            Nouvel utilisateur
          </DialogTitle>
          <DialogDescription>
            L'utilisateur recevra son mot de passe à la création. Pensez à le lui transmettre par canal sécurisé.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-2">
          <Field label="Nom complet" error={errors.name?.message} colSpan>
            <Input placeholder="Maryam Houssein" {...register("name")} />
          </Field>
          <Field label="Email" error={errors.email?.message} colSpan>
            <Input type="email" placeholder="user@pharmasoft.dj" {...register("email")} />
          </Field>
          <Field label="Mot de passe initial" error={errors.password?.message} colSpan>
            <Input type="text" placeholder="8+ caractères, 1 majuscule, 1 chiffre" {...register("password")} />
          </Field>
          <Field label="Rôle" error={errors.role?.message}>
            <select
              {...register("role")}
              className="h-[38px] w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              {availableRoles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Langue par défaut">
            <select
              {...register("locale")}
              className="h-[38px] w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="FR">Français</option>
              <option value="AR">العربية</option>
              <option value="EN">English</option>
            </select>
          </Field>
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={submitting}>
              <Save size={14} /> {submitting ? "Création…" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  colSpan,
  children,
}: {
  label: string;
  error?: string;
  colSpan?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={colSpan ? "sm:col-span-2" : ""}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error ? <p className="mt-1 text-xs text-[#EF4444]">{error}</p> : null}
    </div>
  );
}
