import React from "react";

export function Select({ label, value, onChange, options = [], size = "md" }) {
  const h = size === "sm" ? 32 : 38;
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "var(--font-sans)" }}>
      {label && <span style={{ font: "var(--text-label)", color: "var(--fg-secondary)" }}>{label}</span>}
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={onChange}
          style={{
            appearance: "none",
            width: "100%",
            height: h,
            padding: "0 30px 0 10px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            color: "var(--fg-primary)",
            font: "var(--text-body-sm)",
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--fg-tertiary)", fontSize: 10 }}>▾</span>
      </div>
    </label>
  );
}
