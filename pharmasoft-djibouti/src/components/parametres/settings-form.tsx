"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { settingsUpdateSchema, type SettingsUpdateInput } from "@/lib/validations/settings";

interface Props {
  initial: SettingsUpdateInput;
}

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SettingsUpdateInput>({
    resolver: zodResolver(settingsUpdateSchema),
    defaultValues: initial,
  });

  async function onSubmit(values: SettingsUpdateInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Échec");
      }
      toast.success("Paramètres enregistrés");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      <Card className="p-6">
        <h3 className="t-h4 mb-4">Pharmacie</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nom" error={errors.pharmacyName?.message} colSpan>
            <Input {...register("pharmacyName")} />
          </Field>
          <Field label="Adresse" error={errors.address?.message} colSpan>
            <Input {...register("address")} />
          </Field>
          <Field label="Ville" error={errors.city?.message}>
            <Input {...register("city")} />
          </Field>
          <Field label="Téléphone" error={errors.phone?.message}>
            <Input {...register("phone")} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="NIF" error={errors.nif?.message}>
            <Input {...register("nif")} />
          </Field>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="t-h4 mb-4">Application</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Taux de TVA (0–1, ex: 0.10 = 10%)" error={errors.tvaRate?.message}>
            <Input type="number" step="0.01" min="0" max="1" {...register("tvaRate", { valueAsNumber: true })} />
          </Field>
          <Field label="Langue par défaut">
            <select
              {...register("defaultLocale")}
              className="h-[38px] w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="FR">Français</option>
              <option value="AR">العربية</option>
              <option value="EN">English</option>
            </select>
          </Field>
          <Field label="Seuil stock bas (par défaut)" error={errors.lowStockDefault?.message}>
            <Input type="number" min={0} {...register("lowStockDefault", { valueAsNumber: true })} />
          </Field>
          <Field label="Alerte péremption — niveau 1 (jours)" error={errors.expiryWarnDays?.message}>
            <Input type="number" min={0} {...register("expiryWarnDays", { valueAsNumber: true })} />
          </Field>
          <Field label="Alerte péremption — urgente (jours)" error={errors.expiryAlertDays?.message}>
            <Input type="number" min={0} {...register("expiryAlertDays", { valueAsNumber: true })} />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          <Save size={14} /> {submitting ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label, error, colSpan, children,
}: {
  label: string; error?: string; colSpan?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={colSpan ? "sm:col-span-2" : ""}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error ? <p className="mt-1 text-xs text-[#EF4444]">{error}</p> : null}
    </div>
  );
}
