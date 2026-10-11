"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

interface DonutChartCardProps {
  title: string;
  subtitle?: string;
  data: DonutDatum[];
  centerValue?: string;
  centerLabel?: string;
  size?: number;
  thickness?: number;
}

// PHARMASOFT — Donut chart + légende latérale (parts en %).
export function DonutChartCard({
  title,
  subtitle,
  data,
  centerValue,
  centerLabel,
  size = 170,
  thickness = 26,
}: DonutChartCardProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="t-h4 m-0">{title}</h3>
        {subtitle ? <p className="t-muted t-small mt-0.5">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-6">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <ResponsiveContainer width={size} height={size}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={(size - thickness) / 2 - thickness / 2}
                outerRadius={(size - thickness) / 2 + thickness / 2}
                stroke="none"
                paddingAngle={1}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {centerValue !== undefined ? (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-xl font-bold leading-none">{centerValue}</div>
                {centerLabel ? <div className="mt-1 text-[11px] text-muted-foreground">{centerLabel}</div> : null}
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2.5 text-[13px]">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: d.color }} />
              <span className="flex-1">{d.label}</span>
              <span className="font-mono font-semibold">{Math.round((d.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
