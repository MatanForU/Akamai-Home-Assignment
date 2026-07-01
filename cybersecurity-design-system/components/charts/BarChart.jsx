import React from "react";

export function BarChart({ data = [], width = 480, height = 200, color = "var(--chart-series-1)", colors }) {
  const pad = { top: 10, right: 10, bottom: 22, left: 34 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value), 1) * 1.15;
  const gap = 10;
  const barW = data.length ? w / data.length - gap : 0;

  return (
    <svg width={width} height={height} style={{ fontFamily: "var(--font-mono)" }}>
      <g transform={`translate(${pad.left},${pad.top})`}>
        {[0, 0.5, 1].map((g, i) => (
          <line key={i} x1={0} x2={w} y1={h * g} y2={h * g} stroke="var(--chart-grid)" strokeWidth={1} />
        ))}
        {data.map((d, i) => {
          const barH = (d.value / max) * h;
          const x = i * (barW + gap);
          const c = (colors && colors[i]) || d.color || color;
          return (
            <g key={i}>
              <rect x={x} y={h - barH} width={barW} height={barH} rx={3} fill={c} />
              <text x={x + barW / 2} y={h + 16} fontSize={10} fill="var(--chart-axis)" textAnchor="middle">
                {d.label}
              </text>
            </g>
          );
        })}
        <text x={-8} y={4} fontSize={10} fill="var(--chart-axis)" textAnchor="end">{Math.round(max)}</text>
      </g>
    </svg>
  );
}
