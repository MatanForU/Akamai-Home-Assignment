import React from "react";

type Severity = "critical" | "high" | "medium" | "low" | "info";

const SEV: Record<Severity, { fg: string; bg: string }> = {
  critical: { fg: "var(--sev-critical)", bg: "var(--sev-critical-bg)" },
  high:     { fg: "var(--sev-high)",     bg: "var(--sev-high-bg)" },
  medium:   { fg: "var(--sev-medium)",   bg: "var(--sev-medium-bg)" },
  low:      { fg: "var(--sev-low)",      bg: "var(--sev-low-bg)" },
  info:     { fg: "var(--sev-info)",     bg: "var(--sev-info-bg)" },
};

interface AlertCardProps {
  severity?: Severity;
  title: React.ReactNode;
  meta?: React.ReactNode;
  timestamp?: string;
  actions?: React.ReactNode;
}

export function AlertCard({ severity = "medium", title, meta, timestamp, actions }: AlertCardProps) {
  const c = SEV[severity];
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "14px 16px",
        fontFamily: "var(--font-sans)",
        alignItems: "flex-start",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.fg, marginTop: 6, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              font: "var(--text-caption)",
              fontWeight: 700,
              color: c.fg,
              background: c.bg,
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-wide)",
            }}
          >
            {severity}
          </span>
          {timestamp && <span style={{ font: "var(--text-mono-sm)", color: "var(--fg-tertiary)" }}>{timestamp}</span>}
        </div>
        <div style={{ font: "var(--text-h4)", color: "var(--fg-primary)" }}>{title}</div>
        {meta && <div style={{ font: "var(--text-mono-sm)", color: "var(--fg-secondary)" }}>{meta}</div>}
      </div>
      {actions && <div style={{ flexShrink: 0, display: "flex", gap: 6 }}>{actions}</div>}
    </div>
  );
}
