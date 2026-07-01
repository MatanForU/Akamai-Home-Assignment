import React from "react";

export function AssetCard({ name, type, status = "healthy", endpointCount, lastScanned, icon }) {
  const statusColor = status === "healthy" ? "var(--success)" : status === "warning" ? "var(--warning)" : "var(--danger)";
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 18px",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minWidth: 200,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", background: "var(--accent-primary-bg)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ font: "var(--text-label)", color: "var(--fg-primary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
          <div style={{ font: "var(--text-mono-sm)", color: "var(--fg-tertiary)" }}>{type}</div>
        </div>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, marginLeft: "auto", flexShrink: 0 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", font: "var(--text-caption)", color: "var(--fg-secondary)" }}>
        <span>{endpointCount} endpoints</span>
        <span>scanned {lastScanned}</span>
      </div>
    </div>
  );
}
