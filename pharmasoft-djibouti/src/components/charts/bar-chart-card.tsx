"use client";

import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";

export interface BarDatum {
  label: string;
  value: number;
  highlight?: boolean;
}

interface BarChartCardProps {
  title: string;
  subtitle?: string;
  data: BarDatum[];
  color?: string;
  highlightColor?: string;
  legend?: React.ReactNode;
  formatValue?: (v: number) => string;
  height?: number;
}

// PHARMASOFT — Card avec barres verticales, format "Fdj/k" en axe Y.
export function BarChartCard({
  title,
  subtitle,
  data,
  color = "#0EA5E9",
  highlightColor = "#10B981",
  legend,
  formatValue = (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`),
  height = 260,
}: BarChartCardProps) {
  return (
    <Card className="p-5">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h3 className="t-h4 m-0">{title}</h3>
          {subtitle ? <p className="t-muted t-small mt-0.5">{subtitle}</p> : null}
        </div>
        {legend ? <div className="flex gap-3 text-xs">{legend}</div> : null}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <RBarChart data={data} margin={{ top: 16, right: 0, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border-hsl))" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "hsl(var(--text-muted-hsl))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--text-subtle-hsl))", fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatValue}
            width={48}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--bg-sunken-hsl))" }}
            contentStyle={{
              background: "hsl(var(--bg-elev-hsl))",
              border: "1px solid hsl(var(--border-hsl))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) => formatValue(v)}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.highlight ? highlightColor : color} opacity={d.highlight ? 1 : 0.92} />
            ))}
          </Bar>
        </RBarChart>
      </ResponsiveContainer>
    </Card>
  );
}
