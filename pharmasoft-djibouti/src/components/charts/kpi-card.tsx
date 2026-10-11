import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Sparkline } from "@/components/charts/sparkline";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaDir?: "up" | "down";
  deltaSuffix?: string;
  icon: LucideIcon;
  accent: string;          // Couleur HEX
  spark?: number[];        // Données sparkline (optionnel)
}

// PHARMASOFT — Card KPI : libellé + valeur + delta + sparkline + icône accent.
// Reproduction fidèle du composant KpiCard de la maquette (screens-all.jsx).
export function KpiCard({
  label,
  value,
  delta,
  deltaDir = "up",
  deltaSuffix = "vs hier",
  icon: Icon,
  accent,
  spark,
}: KpiCardProps) {
  const DeltaIcon = deltaDir === "up" ? TrendingUp : TrendingDown;
  return (
    <Card className="relative flex flex-col gap-2 overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div className="text-[13px] font-medium text-muted-foreground">{label}</div>
        <div
          className="grid h-8 w-8 place-items-center rounded-md"
          style={{ background: `${accent}20`, color: accent }}
        >
          <Icon size={16} />
        </div>
      </div>
      <div className="font-mono text-[28px] font-bold tracking-tight tabular-nums">{value}</div>
      <div className="flex items-center justify-between">
        {delta ? (
          <div
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              deltaDir === "up" ? "text-[#22C55E]" : "text-[#EF4444]",
            )}
          >
            <DeltaIcon size={12} />
            <span>{delta}</span>
            <span className="ml-1 font-normal text-muted-foreground">{deltaSuffix}</span>
          </div>
        ) : (
          <span />
        )}
        {spark && spark.length > 1 ? (
          <Sparkline data={spark} width={80} height={28} color={accent} />
        ) : null}
      </div>
    </Card>
  );
}
