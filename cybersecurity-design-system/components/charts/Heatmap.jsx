import React from "react";

function colorFor(intensity) {
  // 0..1 -> neutral to critical-tinted heat
  const stops = ["var(--chart-grid)", "var(--sev-low-bg)", "var(--sev-medium-bg)", "var(--sev-high-bg)", "var(--sev-critical)"];
  if (intensity <= 0) return stops[0];
  if (intensity < 0.3) return stops[1];
  if (intensity < 0.6) return stops[2];
  if (intensity < 0.85) return stops[3];
  return stops[4];
}

export function Heatmap({ rows = [], cols = [], values = [], cellSize = 20 }) {
  const max = Math.max(...values.flat(), 1);
  return (
    <div style={{ fontFamily: "var(--font-mono)", display: "inline-block" }}>
      <div style={{ display: "flex", marginLeft: 90 }}>
        {cols.map((c, i) => (
          <div key={i} style={{ width: cellSize, fontSize: 9, color: "var(--fg-tertiary)", textAlign: "center" }}>{c}</div>
        ))}
      </div>
      {rows.map((r, ri) => (
        <div key={ri} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 90, fontSize: 10, color: "var(--fg-secondary)", paddingRight: 8, textAlign: "right", flexShrink: 0 }}>{r}</div>
          {cols.map((c, ci) => {
            const v = (values[ri] && values[ri][ci]) || 0;
            return (
              <div
                key={ci}
                title={`${r} · ${c}: ${v}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: colorFor(v / max),
                  border: "1px solid var(--bg-canvas)",
                  boxSizing: "border-box",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
