"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/data-table";
import { MedImage } from "@/components/charts/med-image";
import { fmtMoney } from "@/lib/utils";

export interface MedicineRow {
  id: string;
  code: string;
  name: string;
  dci: string;
  form: string;
  dosage: string;
  laboratory: string;
  category: string;
  sellPrice: number;
  purchasePrice?: number;          // peut être omis si VENDEUR
  stock: number;
  status: "ok" | "low" | "out";
  requiresPrescription: boolean;
}

export function MedicinesTable({
  data,
  canSeePurchase,
}: {
  data: MedicineRow[];
  canSeePurchase: boolean;
}) {
  const locale = useLocale();

  const columns: ColumnDef<MedicineRow>[] = [
    {
      accessorKey: "name",
      header: "Médicament",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <MedImage name={row.original.name} size={36} />
          <div className="min-w-0">
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.dci} · {row.original.laboratory}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "category",
      header: "Catégorie",
      cell: ({ row }) => (
        <Badge variant="neutral" className="text-[11px]">
          {row.original.category.replaceAll("_", " ").toLowerCase()}
        </Badge>
      ),
    },
    {
      accessorKey: "dosage",
      header: "Forme",
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.form.replaceAll("_", " ").toLowerCase()}</div>
          <div className="text-xs text-muted-foreground">{row.original.dosage}</div>
        </div>
      ),
    },
    {
      accessorKey: "sellPrice",
      header: "Prix vente",
      cell: ({ row }) => (
        <div className="font-mono text-sm font-semibold">{fmtMoney(row.original.sellPrice)}</div>
      ),
    },
    ...(canSeePurchase
      ? [
          {
            accessorKey: "purchasePrice",
            header: "Prix achat",
            cell: ({ row }) => (
              <div className="font-mono text-xs text-muted-foreground">
                {row.original.purchasePrice !== undefined ? fmtMoney(row.original.purchasePrice) : "—"}
              </div>
            ),
          } as ColumnDef<MedicineRow>,
        ]
      : []),
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge variant={s === "out" ? "destructive" : s === "low" ? "warning" : "success"}>
            {s === "out" ? "Rupture" : `${row.original.stock} u.`}
          </Badge>
        );
      },
    },
    {
      id: "rx",
      header: "Rx",
      cell: ({ row }) =>
        row.original.requiresPrescription ? (
          <Badge variant="warning" className="text-[10px]">
            Rx
          </Badge>
        ) : null,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Link
          href={`/${locale}/medicaments/${row.original.id}`}
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Ouvrir la fiche"
        >
          <ExternalLink size={14} />
        </Link>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} searchPlaceholder="Rechercher par nom, DCI, code…" pageSize={15} />;
}
