import React from "react";

export function Dialog({ open, title, description, onClose, actions, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--scrim)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        fontFamily: "var(--font-sans)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          maxWidth: "90vw",
          background: "var(--bg-surface-raised)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          padding: 22,
        }}
      >
        <div style={{ font: "var(--text-h3)", color: "var(--fg-primary)", marginBottom: 6 }}>{title}</div>
        {description && <div style={{ font: "var(--text-body-sm)", color: "var(--fg-secondary)", marginBottom: 16 }}>{description}</div>}
        {children}
        {actions && <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>{actions}</div>}
      </div>
    </div>
  );
}
