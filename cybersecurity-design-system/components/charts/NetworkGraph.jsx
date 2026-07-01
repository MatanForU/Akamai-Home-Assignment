import React from "react";

export function NetworkGraph({ nodes = [], edges = [], width = 480, height = 260 }) {
  return (
    <svg width={width} height={height} style={{ fontFamily: "var(--font-mono)" }}>
      {edges.map((e, i) => {
        const a = nodes.find((n) => n.id === e.from);
        const b = nodes.find((n) => n.id === e.to);
        if (!a || !b) return null;
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--border-strong)"
            strokeWidth={e.flagged ? 1.6 : 1}
            strokeDasharray={e.flagged ? "3 3" : undefined}
            opacity={e.flagged ? 0.9 : 0.5}
          />
        );
      })}
      {edges
        .filter((e) => e.flagged)
        .map((e, i) => {
          const a = nodes.find((n) => n.id === e.from);
          const b = nodes.find((n) => n.id === e.to);
          if (!a || !b) return null;
          return <line key={"f" + i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--sev-critical)" strokeWidth={1.8} opacity={0.9} />;
        })}
      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={n.kind === "hub" ? 14 : 9} fill={n.flagged ? "var(--sev-critical-bg)" : "var(--accent-primary-bg)"} stroke={n.flagged ? "var(--sev-critical)" : "var(--accent-primary)"} strokeWidth={1.5} />
          <text x={n.x} y={n.y + (n.kind === "hub" ? 26 : 20)} fontSize={9.5} textAnchor="middle" fill="var(--fg-secondary)">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
