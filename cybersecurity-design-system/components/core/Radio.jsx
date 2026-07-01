import React from "react";

export function Radio({ checked, onChange, label, disabled = false }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily: "var(--font-sans)" }}>
      <span
        onClick={() => !disabled && onChange && onChange()}
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: `1px solid ${checked ? "var(--accent-primary)" : "var(--border-strong)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-primary)" }} />}
      </span>
      {label && <span style={{ font: "var(--text-body-sm)", color: "var(--fg-primary)" }}>{label}</span>}
    </label>
  );
}
