import React from "react";

export function EmptyState({ icon, title, description, action }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 10,
        padding: "48px 24px",
        fontFamily: "var(--font-sans)",
      }}
    >
      {icon && (
        <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--accent-primary-bg)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
      )}
      <div style={{ font: "var(--text-h4)", color: "var(--fg-primary)" }}>{title}</div>
      {description && <div style={{ font: "var(--text-body-sm)", color: "var(--fg-secondary)", maxWidth: 320 }}>{description}</div>}
      {action}
    </div>
  );
}
