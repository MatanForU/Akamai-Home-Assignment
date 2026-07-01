import React from "react";

export function Switch({ checked, onChange, disabled = false, label }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily: "var(--font-sans)" }}>
      <span
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          width: 34,
          height: 20,
          borderRadius: "var(--radius-pill)",
          background: checked ? "var(--accent-primary)" : "var(--border-strong)",
          position: "relative",
          transition: "background var(--duration-base) var(--ease-standard)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 16 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "var(--n-0)",
            boxShadow: "var(--shadow-xs)",
            transition: "left var(--duration-base) var(--ease-standard)",
          }}
        />
      </span>
      {label && <span style={{ font: "var(--text-body-sm)", color: "var(--fg-primary)" }}>{label}</span>}
    </label>
  );
}
