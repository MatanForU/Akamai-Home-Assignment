import React, { useState } from "react";

export function Tabs({ items = [], defaultValue, value, onChange }) {
  const [internal, setInternal] = useState(defaultValue || (items[0] && items[0].value));
  const active = value !== undefined ? value : internal;
  const set = (v) => {
    setInternal(v);
    onChange && onChange(v);
  };
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border-subtle)", fontFamily: "var(--font-sans)" }}>
      {items.map((it) => {
        const isActive = it.value === active;
        return (
          <button
            key={it.value}
            onClick={() => set(it.value)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${isActive ? "var(--accent-primary)" : "transparent"}`,
              color: isActive ? "var(--fg-primary)" : "var(--fg-secondary)",
              font: "var(--text-label)",
              fontWeight: isActive ? 600 : 500,
              padding: "10px 4px",
              marginBottom: -1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {it.label}
            {it.count !== undefined && (
              <span style={{ font: "var(--text-mono-sm)", color: "var(--fg-tertiary)", background: "var(--bg-surface-sunken)", borderRadius: "var(--radius-pill)", padding: "1px 6px" }}>{it.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
