// PHARMASOFT — Minimal SVG charts (bar, donut, line, sparkline)
// Original implementation — built to match the visual style of the design system.

const BarChart = ({ data, width = 600, height = 240, color = "#0EA5E9", showValues = false, formatValue = v => v }) => {
  const padding = { top: 20, right: 12, bottom: 32, left: 48 };
  const W = width - padding.left - padding.right;
  const H = height - padding.top - padding.bottom;
  const max = Math.max(...data.map(d => d.value)) * 1.15;
  const bw = W / data.length;
  const ticks = 4;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {/* Y grid */}
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const y = padding.top + (H / ticks) * i;
        const value = max - (max / ticks) * i;
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={padding.left + W} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray={i === ticks ? "0" : "2 4"}/>
            <text x={padding.left - 8} y={y + 4} fontSize="10" fill="var(--text-subtle)" textAnchor="end" fontFamily="var(--font-mono)">{formatValue(Math.round(value))}</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const h = (d.value / max) * H;
        const x = padding.left + i * bw + bw * 0.15;
        const y = padding.top + H - h;
        const w = bw * 0.7;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} rx="4"
              fill={d.highlight ? "var(--secondary)" : color}
              style={{ transition: "all 300ms" }}
              opacity={d.highlight ? 1 : 0.92}>
              <title>{d.label}: {formatValue(d.value)}</title>
            </rect>
            <text x={x + w / 2} y={padding.top + H + 18} fontSize="11" fill="var(--text-muted)" textAnchor="middle">{d.label}</text>
            {showValues && <text x={x + w / 2} y={y - 6} fontSize="11" fontWeight="600" fill="var(--text)" textAnchor="middle">{formatValue(d.value)}</text>}
          </g>
        );
      })}
    </svg>
  );
};

const DonutChart = ({ data, size = 220, thickness = 30, centerLabel, centerValue }) => {
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const total = data.reduce((s, d) => s + d.value, 0);
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <svg width={size} height={size} style={{ display: "block", flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-sunken)" strokeWidth={thickness}/>
        {data.map((d, i) => {
          const length = (d.value / total) * circumference;
          const dashOffset = -offset;
          offset += length;
          return (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={d.color} strokeWidth={thickness}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: "stroke-dasharray 500ms" }}
            >
              <title>{d.label}: {Math.round((d.value/total)*100)}%</title>
            </circle>
          );
        })}
        {centerValue !== undefined && (
          <>
            <text x={cx} y={cy - 2} fontSize="20" fontWeight="700" fill="var(--text)" textAnchor="middle">{centerValue}</text>
            {centerLabel && <text x={cx} y={cy + 18} fontSize="11" fill="var(--text-muted)" textAnchor="middle">{centerLabel}</text>}
          </>
        )}
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
            <span className="dot" style={{ background: d.color }}></span>
            <span style={{ flex: 1 }}>{d.label}</span>
            <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{Math.round((d.value/total)*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LineChart = ({ data, width = 700, height = 280, color = "#0EA5E9", formatValue = v => v, showArea = true }) => {
  const padding = { top: 20, right: 16, bottom: 32, left: 48 };
  const W = width - padding.left - padding.right;
  const H = height - padding.top - padding.bottom;
  const max = Math.max(...data.map(d => d.value)) * 1.15;
  const min = 0;
  const ticks = 4;
  const stepX = W / (data.length - 1);

  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + H - ((d.value - min) / (max - min)) * H,
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = pathD + ` L ${points[points.length - 1].x} ${padding.top + H} L ${points[0].x} ${padding.top + H} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="linegrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const y = padding.top + (H / ticks) * i;
        const value = max - (max / ticks) * i;
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={padding.left + W} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray={i === ticks ? "0" : "2 4"}/>
            <text x={padding.left - 8} y={y + 4} fontSize="10" fill="var(--text-subtle)" textAnchor="end" fontFamily="var(--font-mono)">{formatValue(Math.round(value))}</text>
          </g>
        );
      })}
      {showArea && <path d={areaD} fill="url(#linegrad)"/>}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="var(--bg-elev)" stroke={color} strokeWidth="2"/>
          <text x={p.x} y={padding.top + H + 18} fontSize="11" fill="var(--text-muted)" textAnchor="middle">{p.label}</text>
        </g>
      ))}
    </svg>
  );
};

const Sparkline = ({ data, width = 120, height = 40, color = "#0EA5E9", filled = true }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = d + ` L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {filled && <path d={area} fill={color} opacity="0.15"/>}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const HBarChart = ({ data, width = 320, formatValue = v => v }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ fontWeight: 500 }}>{d.label}</span>
            <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{formatValue(d.value)}</span>
          </div>
          <div style={{ height: 8, background: "var(--bg-sunken)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              width: `${(d.value / max) * 100}%`,
              height: "100%",
              background: d.color || "var(--primary)",
              borderRadius: 999,
              transition: "width 400ms ease",
            }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

Object.assign(window, { BarChart, DonutChart, LineChart, Sparkline, HBarChart });
