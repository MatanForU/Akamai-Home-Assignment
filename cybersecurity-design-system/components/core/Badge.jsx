import React from "react";

const SEV_MAP = {
  critical: { fg: "var(--sev-critical)", bg: "var(--sev-critical-bg)" },
  high: { fg: "var(--sev-high)", bg: "var(--sev-high-bg)" },
  medium: { fg: "var(--sev-medium)", bg: "var(--sev-medium-bg)" },
  low: { fg: "var(--sev-low)", bg: "var(--sev-low-bg)" },
  info: { fg: "var(--sev-info)", bg: "var(--sev-info-bg)" },
  success: { fg: "var(--success)", bg: "var(--success-bg)" },
  neutral: { fg: "var(--fg-secondary)", bg: "var(--bg-surface-sunken)" },
};

export function Badge({ tone = "neutral", dot = true, children }) {
  const c = SEV_MAP[tone] || SEV_MAP.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 9px 3px 8px",
        borderRadius: "var(--radius-pill)",
        background: c.bg,
        color: c.fg,
        font: "var(--text-caption)",
        fontWeight: 600,
        lineHeight: 1.3,
        whiteSpace: "nowrap",
      }}
    >
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.fg, flexShrink: 0 }} />
      )}
      {children}
    </span>
  );
}
