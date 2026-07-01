import React from "react";

export function ChartCard({ title, subtitle, chart, footer }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "18px 20px",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div>
        <div style={{ font: "var(--text-h4)", color: "var(--fg-primary)" }}>{title}</div>
        {subtitle && <div style={{ font: "var(--text-caption)", color: "var(--fg-tertiary)" }}>{subtitle}</div>}
      </div>
      <div>{chart}</div>
      {footer && <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 10 }}>{footer}</div>}
    </div>
  );
}
