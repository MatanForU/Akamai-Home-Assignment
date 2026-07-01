import React from "react";

export function LineChart({
  data = [],
  width = 480,
  height = 200,
  color = "var(--chart-series-1)",
  area = true,
  yLabel,
  showGrid = true,
}) {
  const pad = { top: 10, right: 10, bottom: 22, left: 34 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1) * 1.15;
  const min = Math.min(0, Math.min(...values));
  const xStep = data.length > 1 ? w / (data.length - 1) : 0;
  const yFor = (v) => h - ((v - min) / (max - min || 1)) * h;
  const points = data.map((d, i) => [i * xStep, yFor(d.value)]);
  const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const areaPath = `${path} L${points[points.length - 1]?.[0] || 0},${h} L0,${h} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg width={width} height={height} style={{ fontFamily: "var(--font-mono)", overflow: "visible" }}>
      <g transform={`translate(${pad.left},${pad.top})`}>
        {showGrid &&
          gridLines.map((g, i) => (
            <line key={i} x1={0} x2={w} y1={h * g} y2={h * g} stroke="var(--chart-grid)" strokeWidth={1} />
          ))}
        {area && <path d={areaPath} fill={color} opacity={0.12} stroke="none" />}
        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={2.5} fill="var(--bg-surface)" stroke={color} strokeWidth={1.5} />
        ))}
        {data.map(
          (d, i) =>
            (i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) && (
              <text key={i} x={i * xStep} y={h + 16} fontSize={10} fill="var(--chart-axis)" textAnchor="middle">
                {d.label}
              </text>
            )
        )}
        <text x={-8} y={4} fontSize={10} fill="var(--chart-axis)" textAnchor="end">{Math.round(max)}</text>
        <text x={-8} y={h} fontSize={10} fill="var(--chart-axis)" textAnchor="end">{Math.round(min)}</text>
      </g>
    </svg>
  );
}
