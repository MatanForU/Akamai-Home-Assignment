import React from "react";

export function IconButton({ icon, size = "md", variant = "ghost", active = false, disabled = false, onClick, "aria-label": ariaLabel }) {
  const dim = size === "sm" ? 28 : size === "lg" ? 40 : 32;
  const bg = variant === "solid" ? "var(--bg-surface-sunken)" : active ? "var(--accent-primary-bg)" : "transparent";
  const color = active ? "var(--accent-primary)" : "var(--fg-secondary)";
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: dim,
        height: dim,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--radius-sm)",
        border: "1px solid transparent",
        background: bg,
        color,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "background var(--duration-fast) var(--ease-standard), color var(--duration-fast)",
      }}
    >
      {icon}
    </button>
  );
}
