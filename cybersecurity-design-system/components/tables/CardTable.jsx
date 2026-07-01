import React from "react";

export function CardTable({ rows = [], renderTitle, renderMeta, renderTrailing, onRowClick }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "var(--font-sans)" }}>
      {rows.map((r) => (
        <div
          key={r.id}
          onClick={() => onRowClick && onRowClick(r)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: "12px 14px",
            cursor: onRowClick ? "pointer" : "default",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ font: "var(--text-label)", color: "var(--fg-primary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {renderTitle ? renderTitle(r) : r.title}
            </div>
            {renderMeta && <div style={{ font: "var(--text-mono-sm)", color: "var(--fg-tertiary)", marginTop: 2 }}>{renderMeta(r)}</div>}
          </div>
          {renderTrailing && <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>{renderTrailing(r)}</div>}
        </div>
      ))}
    </div>
  );
}
