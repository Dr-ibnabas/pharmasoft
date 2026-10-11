// PHARMASOFT — Sparkline SVG natif (pas de recharts, plus léger).
// Repris de la maquette charts.jsx.
export function Sparkline({
  data,
  width = 120,
  height = 40,
  color = "#0EA5E9",
  filled = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width={width} height={height} className="block">
      {filled && <path d={area} fill={color} opacity={0.15} />}
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
