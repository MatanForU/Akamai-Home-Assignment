import React from "react";

export function Checkbox({ checked, onChange, label, disabled = false }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily: "var(--font-sans)" }}>
      <span
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: `1px solid ${checked ? "var(--accent-primary)" : "var(--border-strong)"}`,
          background: checked ? "var(--accent-primary)" : "var(--bg-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background var(--duration-fast), border-color var(--duration-fast)",
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="var(--fg-on-brand)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label && <span style={{ font: "var(--text-body-sm)", color: "var(--fg-primary)" }}>{label}</span>}
    </label>
  );
}
