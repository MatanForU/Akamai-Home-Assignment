import React from "react";

const TONE = {
  success: { fg: "var(--success)", bg: "var(--success-bg)" },
  danger: { fg: "var(--danger)", bg: "var(--danger-bg)" },
  info: { fg: "var(--sev-info)", bg: "var(--sev-info-bg)" },
  warning: { fg: "var(--warning)", bg: "var(--warning-bg)" },
};

export function Toast({ tone = "info", title, description, onClose }) {
  const c = TONE[tone] || TONE.info;
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        width: 340,
        padding: "12px 14px",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-surface-raised)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-lg)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.fg, marginTop: 6, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ font: "var(--text-label)", color: "var(--fg-primary)", fontWeight: 600 }}>{title}</div>
        {description && <div style={{ font: "var(--text-body-sm)", color: "var(--fg-secondary)", marginTop: 2 }}>{description}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--fg-tertiary)", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>✕</button>
      )}
    </div>
  );
}
