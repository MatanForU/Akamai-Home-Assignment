import React from "react";

export function ListCard({ title, items = [], viewAllLabel = "View all" }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 18px",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ font: "var(--text-h4)", color: "var(--fg-primary)" }}>{title}</span>
        {viewAllLabel && <span style={{ font: "var(--text-caption)", color: "var(--accent-primary)", cursor: "pointer" }}>{viewAllLabel}</span>}
      </div>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "9px 0",
            borderTop: i > 0 ? "1px solid var(--border-subtle)" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
            {it.icon}
            <span style={{ font: "var(--text-body-sm)", color: "var(--fg-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
          </div>
          <span style={{ font: "var(--text-mono-sm)", color: "var(--fg-tertiary)", flexShrink: 0 }}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}
