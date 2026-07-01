import React from "react";

export function Breadcrumb({ items = [] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-sans)", font: "var(--text-caption)" }}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ color: "var(--fg-tertiary)" }}>/</span>}
          <span style={{ color: i === items.length - 1 ? "var(--fg-primary)" : "var(--fg-tertiary)", fontWeight: i === items.length - 1 ? 600 : 400 }}>{it}</span>
        </React.Fragment>
      ))}
    </div>
  );
}
