"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { ClientTier } from "@prisma/client";
import { ExternalLink, Star } from "lucide-react";
import { DataTable } from "@/components/common/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { colorFromString, fmtDate, fmtMoney, initials } from "@/lib/utils";

export interface ClientRow {
  id: string;
  code: string;
  name: string;
  phone: string;
  quarter: string | null;
  tier: ClientTier;
  points: number;
  totalSpent: number;
  lastVisit: string | null;
  allergiesCount: number;
}

const TIER_VARIANT: Record<ClientTier, "primary" | "warning" | "neutral" | "default"> = {
  PLATINE: "primary",
  OR: "warning",
  ARGENT: "neutral",
  BRONZE: "default",
};

export function ClientsTable({ data }: { data: ClientRow[] }) {
  const locale = useLocale();

  const columns: ColumnDef<ClientRow>[] = [
    {
      accessorKey: "name",
      header: "Client",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar style={{ background: colorFromString(c.name) }}>
              <AvatarFallback style={{ background: colorFromString(c.name) }} className="text-xs">
                {initials(c.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.phone}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "quarter",
      header: "Quartier",
      cell: ({ row }) => <span className="text-sm">{row.original.quarter ?? "—"}</span>,
    },
    {
      accessorKey: "tier",
      header: "Fidélité",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant={TIER_VARIANT[row.original.tier]}>{row.original.tier}</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Star size={10} /> {row.original.points}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "totalSpent",
      header: "Total achats",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold">{fmtMoney(row.original.totalSpent)}</span>
      ),
    },
    {
      accessorKey: "lastVisit",
      header: "Dernière visite",
      cell: ({ row }) =>
        row.original.lastVisit ? (
          <span className="text-sm">{fmtDate(row.original.lastVisit)}</span>
        ) : (
          <span className="text-xs text-muted-foreground">Jamais</span>
        ),
    },
    {
      id: "alerts",
      header: "Alertes",
      cell: ({ row }) =>
        row.original.allergiesCount > 0 ? (
          <Badge variant="destructive" className="text-[10px]">
            {row.original.allergiesCount} allergie{row.original.allergiesCount > 1 ? "s" : ""}
          </Badge>
        ) : null,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Link
          href={`/${locale}/clients/${row.original.id}`}
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ExternalLink size={14} />
        </Link>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} searchPlaceholder="Rechercher par nom, téléphone…" pageSize={15} />;
}
