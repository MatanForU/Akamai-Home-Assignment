import React from "react";

export function Sparkline({ values = [], width = 100, height = 28, color = "var(--chart-series-1)" }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  const yFor = (v) => height - ((v - min) / (max - min || 1)) * height;
  const path = values.map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${yFor(v)}`).join(" ");
  const last = values[values.length - 1];
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <path d={path} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      {values.length > 0 && <circle cx={(values.length - 1) * step} cy={yFor(last)} r={2} fill={color} />}
    </svg>
  );
}
