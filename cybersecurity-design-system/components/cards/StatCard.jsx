import React from "react";

export function StatCard({ label, value, delta, deltaTone = "success", sparkline, unit }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontFamily: "var(--font-sans)",
        minWidth: 180,
      }}
    >
      <span style={{ font: "var(--text-overline)", letterSpacing: "var(--tracking-overline)", color: "var(--fg-tertiary)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ font: "var(--text-mono-stat)", color: "var(--fg-primary)" }}>{value}</span>
        {unit && <span style={{ font: "var(--text-body-sm)", color: "var(--fg-tertiary)" }}>{unit}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {delta && (
          <span style={{ font: "var(--text-caption)", fontWeight: 600, color: deltaTone === "success" ? "var(--success)" : deltaTone === "danger" ? "var(--danger)" : "var(--fg-secondary)" }}>
            {delta}
          </span>
        )}
        {sparkline}
      </div>
    </div>
  );
}
