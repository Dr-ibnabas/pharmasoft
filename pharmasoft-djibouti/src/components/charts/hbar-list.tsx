// PHARMASOFT — Liste de barres horizontales (top-X par valeur).
// Pas de recharts, juste du flex + width%.
export interface HBarDatum {
  label: string;
  value: number;
  color?: string;
}

export function HBarList({
  data,
  formatValue = (v) => v.toString(),
}: {
  data: HBarDatum[];
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="flex justify-between text-[13px]">
            <span className="font-medium">{d.label}</span>
            <span className="font-mono font-semibold text-muted-foreground">{formatValue(d.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color ?? "#0EA5E9" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
