import React from "react";

export function GaugeChart({ value = 0, max = 100, label, size = 160, color = "var(--accent-primary)" }) {
  const r = size / 2 - 14;
  const c = size / 2;
  const startAngle = 180;
  const endAngle = 0;
  const frac = Math.min(1, Math.max(0, value / max));
  const angle = startAngle - frac * 180;
  const toXY = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return [c + r * Math.cos(rad), c - r * Math.sin(rad)];
  };
  const [sx, sy] = toXY(startAngle);
  const [ex, ey] = toXY(endAngle);
  const [px, py] = toXY(angle);
  const arc = (a1, a2) => {
    const [x1, y1] = toXY(a1);
    const [x2, y2] = toXY(a2);
    const large = a1 - a2 > 180 ? 1 : 0;
    return `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`;
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "var(--font-sans)" }}>
      <svg width={size} height={size / 2 + 20}>
        <path d={arc(startAngle, endAngle)} fill="none" stroke="var(--chart-grid)" strokeWidth={12} strokeLinecap="round" />
        <path d={arc(startAngle, angle)} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" />
        <circle cx={px} cy={py} r={5} fill={color} />
        <text x={c} y={size / 2 - 6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={26} fontWeight={600} fill="var(--fg-primary)">
          {Math.round(value)}
        </text>
      </svg>
      {label && <span style={{ font: "var(--text-caption)", color: "var(--fg-secondary)", marginTop: -6 }}>{label}</span>}
    </div>
  );
}
