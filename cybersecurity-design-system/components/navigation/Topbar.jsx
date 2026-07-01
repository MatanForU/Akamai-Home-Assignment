import React from "react";

export function Topbar({ title, breadcrumb, actions, search = null }) {
  return (
    <div
      style={{
        height: "var(--topbar-h)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-canvas)",
        fontFamily: "var(--font-sans)",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
        {breadcrumb && <span style={{ font: "var(--text-caption)", color: "var(--fg-tertiary)" }}>{breadcrumb}</span>}
        <span style={{ font: "var(--text-h4)", color: "var(--fg-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {search}
        {actions}
      </div>
    </div>
  );
}
