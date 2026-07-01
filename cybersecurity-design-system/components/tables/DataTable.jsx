import React, { useState } from "react";

export function DataTable({ columns = [], rows = [], selectable = false, expandable = false, renderExpanded, dense = false, onRowClick }) {
  const [selected, setSelected] = useState({});
  const [expanded, setExpanded] = useState({});
  const rowH = dense ? 38 : 46;

  const toggleAll = (checked) => {
    const next = {};
    if (checked) rows.forEach((r) => (next[r.id] = true));
    setSelected(next);
  };
  const allChecked = rows.length > 0 && rows.every((r) => selected[r.id]);

  return (
    <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden", fontFamily: "var(--font-sans)", background: "var(--bg-surface)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--bg-surface-sunken)" }}>
            {expandable && <th style={{ width: 32 }} />}
            {selectable && (
              <th style={{ width: 36, padding: "0 0 0 14px" }}>
                <input type="checkbox" checked={allChecked} onChange={(e) => toggleAll(e.target.checked)} />
              </th>
            )}
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: c.align || "left",
                  padding: "10px 14px",
                  font: "var(--text-overline)",
                  letterSpacing: "var(--tracking-overline)",
                  color: "var(--fg-tertiary)",
                  borderBottom: "1px solid var(--border-default)",
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <React.Fragment key={r.id}>
              <tr
                onClick={() => onRowClick && onRowClick(r)}
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  cursor: onRowClick ? "pointer" : "default",
                  height: rowH,
                }}
              >
                {expandable && (
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded((s) => ({ ...s, [r.id]: !s[r.id] }));
                      }}
                      style={{ border: "none", background: "none", color: "var(--fg-tertiary)", cursor: "pointer", fontSize: 10, transform: expanded[r.id] ? "rotate(90deg)" : "none", transition: "transform var(--duration-fast)" }}
                    >
                      ▶
                    </button>
                  </td>
                )}
                {selectable && (
                  <td style={{ padding: "0 0 0 14px" }}>
                    <input
                      type="checkbox"
                      checked={!!selected[r.id]}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setSelected((s) => ({ ...s, [r.id]: e.target.checked }))}
                    />
                  </td>
                )}
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{
                      padding: "0 14px",
                      textAlign: c.align || "left",
                      font: c.mono ? "var(--text-mono-sm)" : "var(--text-body-sm)",
                      color: "var(--fg-primary)",
                    }}
                  >
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
              {expandable && expanded[r.id] && (
                <tr style={{ background: "var(--bg-surface-sunken)" }}>
                  <td colSpan={columns.length + (selectable ? 2 : 1)} style={{ padding: "14px 20px" }}>
                    {renderExpanded ? renderExpanded(r) : null}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
