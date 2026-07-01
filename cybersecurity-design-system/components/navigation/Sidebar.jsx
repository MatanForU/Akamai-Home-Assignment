import React from "react";

export function Sidebar({ items = [], activeValue, onSelect, productName = "Sentra", logo = null }) {
  return (
    <div
      style={{
        width: "var(--sidebar-w)",
        height: "100%",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-sans)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "18px 18px 14px" }}>
        {logo}
        <span style={{ font: "650 1.0625rem/1 var(--font-sans)", color: "var(--fg-primary)", letterSpacing: "var(--tracking-tight)" }}>{productName}</span>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 10px" }}>
        {items.map((it) => {
          const isActive = it.value === activeValue;
          return (
            <button
              key={it.value}
              onClick={() => onSelect && onSelect(it.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: isActive ? "var(--accent-primary-bg)" : "transparent",
                color: isActive ? "var(--accent-primary)" : "var(--fg-secondary)",
                font: "var(--text-label)",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
            >
              {it.icon}
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.badge !== undefined && (
                <span style={{ font: "var(--text-mono-sm)", color: "var(--sev-critical)", background: "var(--sev-critical-bg)", borderRadius: "var(--radius-pill)", padding: "1px 6px" }}>{it.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
