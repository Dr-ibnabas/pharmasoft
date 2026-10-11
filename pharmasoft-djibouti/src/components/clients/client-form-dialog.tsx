"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { clientCreateSchema, CLIENT_TIERS, type ClientCreateInput } from "@/lib/validations/client";

interface Props {
  mode: "create" | "edit";
  initial?: Partial<ClientCreateInput> & { id?: string };
  trigger: React.ReactNode;
}

const ALLERGIES_SUGGESTIONS = ["Pénicilline", "Aspirine", "Sulfamides", "Iode", "Codéine"];
const CONDITIONS_SUGGESTIONS = ["Diabète II", "Hypertension", "Asthme", "Glaucome", "Insuf. rénale"];

export function ClientFormDialog({ mode, initial, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch } = useForm<ClientCreateInput>({
    resolver: zodResolver(clientCreateSchema),
    defaultValues: {
      name: initial?.name ?? "",
      phone: initial?.phone ?? "+253 77 ",
      email: initial?.email ?? "",
      gender: initial?.gender ?? "M",
      quarter: initial?.quarter ?? "",
      address: initial?.address ?? "",
      tier: initial?.tier ?? "BRONZE",
      allergies: initial?.allergies ?? [],
      conditions: initial?.conditions ?? [],
      notes: initial?.notes ?? "",
    },
  });

  const allergies = watch("allergies") ?? [];
  const conditions = watch("conditions") ?? [];

  async function onSubmit(values: ClientCreateInput) {
    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/clients" : `/api/clients/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Échec");
      }
      toast.success(mode === "create" ? "Client créé" : "Client mis à jour");
      setOpen(false);
      reset();
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleChip(field: "allergies" | "conditions", value: string) {
    const cur = (field === "allergies" ? allergies : conditions) ?? [];
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    setValue(field, next);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={18} className="text-primary" />
            {mode === "create" ? "Nouveau client" : "Modifier le client"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-2">
          <Field label="Nom complet" error={errors.name?.message} colSpan>
            <Input placeholder="Ahmed Hassan Ali" {...register("name")} />
          </Field>

          <Field label="Téléphone" error={errors.phone?.message}>
            <Input placeholder="+253 77 XX XX XX" {...register("phone")} />
          </Field>
          <Field label="Email (optionnel)" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>

          <Field label="Genre">
            <select
              {...register("gender")}
              className="h-[38px] w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </Field>
          <Field label="Date de naissance">
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field }) => (
                <Input
                  type="date"
                  value={typeof field.value === "string" ? field.value.slice(0, 10) : ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              )}
            />
          </Field>

          <Field label="Quartier" colSpan>
            <Input placeholder="Plateau du Serpent, Héron, Balbala…" {...register("quarter")} />
          </Field>

          <Field label="Tier de fidélité" colSpan>
            <div className="flex gap-2">
              {CLIENT_TIERS.map((t) => (
                <label key={t} className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm">
                  <input type="radio" value={t} {...register("tier")} className="h-4 w-4" />
                  {t}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Allergies connues" colSpan>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {allergies.length === 0 ? (
                <span className="text-xs text-muted-foreground">Aucune allergie déclarée</span>
              ) : (
                allergies.map((a) => (
                  <Badge key={a} variant="destructive" className="cursor-pointer" onClick={() => toggleChip("allergies", a)}>
                    {a} <X size={10} />
                  </Badge>
                ))
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALLERGIES_SUGGESTIONS.filter((a) => !allergies.includes(a)).map((a) => (
                <Badge key={a} variant="outline" className="cursor-pointer" onClick={() => toggleChip("allergies", a)}>
                  + {a}
                </Badge>
              ))}
            </div>
          </Field>

          <Field label="Conditions chroniques" colSpan>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {conditions.length === 0 ? (
                <span className="text-xs text-muted-foreground">Aucune condition</span>
              ) : (
                conditions.map((c) => (
                  <Badge key={c} variant="warning" className="cursor-pointer" onClick={() => toggleChip("conditions", c)}>
                    {c} <X size={10} />
                  </Badge>
                ))
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CONDITIONS_SUGGESTIONS.filter((c) => !conditions.includes(c)).map((c) => (
                <Badge key={c} variant="outline" className="cursor-pointer" onClick={() => toggleChip("conditions", c)}>
                  + {c}
                </Badge>
              ))}
            </div>
          </Field>

          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              <Save size={14} /> {submitting ? "Enregistrement…" : "Enregistrer"}
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
