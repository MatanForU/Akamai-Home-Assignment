import React from "react";

export function DonutChart({ data = [], size = 160, thickness = 22, centerLabel, centerValue }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - thickness / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: "var(--font-sans)" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--chart-grid)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * circumference;
          const el = (
            <circle
              key={i}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return el;
        })}
        <text
          x={c}
          y={c}
          transform={`rotate(90 ${c} ${c})`}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={centerLabel ? 22 : 0}
          fontFamily="var(--font-mono)"
          fill="var(--fg-primary)"
          fontWeight={600}
        >
          {centerValue}
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, font: "var(--text-caption)", color: "var(--fg-secondary)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
            {d.label}
            <span style={{ color: "var(--fg-tertiary)" }}>{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
