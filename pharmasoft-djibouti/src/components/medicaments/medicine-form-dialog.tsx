"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pill, Save } from "lucide-react";
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
import {
  medicineCreateSchema,
  MEDICINE_FORMS,
  MEDICINE_CATEGORIES,
  type MedicineCreateInput,
} from "@/lib/validations/medicine";

interface Props {
  mode: "create" | "edit";
  initial?: Partial<MedicineCreateInput> & { id?: string };
  trigger: React.ReactNode;
  canSeePurchase: boolean;
}

// PHARMASOFT — Dialog création/édition d'un médicament.
// Soumet via fetch sur /api/medicines (POST) ou /api/medicines/[id] (PATCH).
export function MedicineFormDialog({ mode, initial, trigger, canSeePurchase }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MedicineCreateInput>({
    resolver: zodResolver(medicineCreateSchema),
    defaultValues: {
      code: initial?.code ?? "",
      name: initial?.name ?? "",
      dci: initial?.dci ?? "",
      form: initial?.form ?? "COMPRIME",
      dosage: initial?.dosage ?? "",
      laboratory: initial?.laboratory ?? "",
      category: initial?.category ?? "AUTRE",
      barcode: initial?.barcode ?? "",
      sellPrice: initial?.sellPrice ?? 0,
      purchasePrice: initial?.purchasePrice ?? 0,
      requiresPrescription: initial?.requiresPrescription ?? false,
      controlledSubstance: initial?.controlledSubstance ?? false,
      lowStockThreshold: initial?.lowStockThreshold ?? 20,
      description: initial?.description ?? "",
    },
  });

  async function onSubmit(values: MedicineCreateInput) {
    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/medicines" : `/api/medicines/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Échec de l'enregistrement");
      }
      toast.success(mode === "create" ? "Médicament créé" : "Médicament mis à jour");
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill size={18} className="text-primary" />
            {mode === "create" ? "Nouveau médicament" : "Modifier le médicament"}
          </DialogTitle>
          <DialogDescription>
            Renseignez les informations du produit. Les champs marqués sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <Field label="Code interne" error={errors.code?.message}>
            <Input placeholder="M001" {...register("code")} />
          </Field>
          <Field label="Code-barres" error={errors.barcode?.message}>
            <Input placeholder="61700001" {...register("barcode")} />
          </Field>

          <Field label="Nom commercial" error={errors.name?.message} colSpan>
            <Input placeholder="Doliprane 500mg" {...register("name")} />
          </Field>

          <Field label="DCI" error={errors.dci?.message}>
            <Input placeholder="Paracétamol" {...register("dci")} />
          </Field>
          <Field label="Laboratoire" error={errors.laboratory?.message}>
            <Input placeholder="Sanofi" {...register("laboratory")} />
          </Field>

          <Field label="Forme" error={errors.form?.message}>
            <select
              {...register("form")}
              className="h-[38px] w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              {MEDICINE_FORMS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Dosage" error={errors.dosage?.message}>
            <Input placeholder="500mg" {...register("dosage")} />
          </Field>

          <Field label="Catégorie" error={errors.category?.message}>
            <select
              {...register("category")}
              className="h-[38px] w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              {MEDICINE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replaceAll("_", " ")}</option>
              ))}
            </select>
          </Field>
          <Field label="Seuil stock bas" error={errors.lowStockThreshold?.message}>
            <Input type="number" min={0} {...register("lowStockThreshold", { valueAsNumber: true })} />
          </Field>

          <Field label="Prix de vente (Fdj)" error={errors.sellPrice?.message}>
            <Input type="number" min={0} {...register("sellPrice", { valueAsNumber: true })} />
          </Field>
          {canSeePurchase ? (
            <Field label="Prix d'achat (Fdj)" error={errors.purchasePrice?.message}>
              <Input type="number" min={0} {...register("purchasePrice", { valueAsNumber: true })} />
            </Field>
          ) : null}

          <div className="col-span-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("requiresPrescription")} className="h-4 w-4" />
              Sous ordonnance
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("controlledSubstance")} className="h-4 w-4" />
              Substance contrôlée
            </label>
          </div>

          <Field label="Description (optionnel)" error={errors.description?.message} colSpan>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
            />
          </Field>

          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              <Save size={14} />
              {submitting ? "Enregistrement…" : "Enregistrer"}
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
