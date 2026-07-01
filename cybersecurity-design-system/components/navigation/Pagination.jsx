import React from "react";

export function Pagination({ page = 1, pageCount = 1, onChange }) {
  const go = (p) => p >= 1 && p <= pageCount && onChange && onChange(p);
  const btn = (label, target, disabled, active) => (
    <button
      key={label}
      onClick={() => go(target)}
      disabled={disabled}
      style={{
        minWidth: 28,
        height: 28,
        padding: "0 6px",
        borderRadius: "var(--radius-sm)",
        border: `1px solid ${active ? "var(--accent-primary)" : "var(--border-default)"}`,
        background: active ? "var(--accent-primary-bg)" : "var(--bg-surface)",
        color: active ? "var(--accent-primary)" : "var(--fg-secondary)",
        font: "var(--text-mono-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {label}
    </button>
  );
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "var(--font-sans)" }}>
      {btn("‹", page - 1, page <= 1, false)}
      {pages.map((p) => btn(String(p), p, false, p === page))}
      {btn("›", page + 1, page >= pageCount, false)}
    </div>
  );
}
