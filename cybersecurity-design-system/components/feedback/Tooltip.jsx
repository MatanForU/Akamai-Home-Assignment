import React, { useState } from "react";

export function Tooltip({ label, children, side = "top" }) {
  const [open, setOpen] = useState(false);
  const pos =
    side === "top"
      ? { bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" }
      : side === "bottom"
      ? { top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" }
      : side === "left"
      ? { right: "calc(100% + 6px)", top: "50%", transform: "translateY(-50%)" }
      : { left: "calc(100% + 6px)", top: "50%", transform: "translateY(-50%)" };
  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          style={{
            position: "absolute",
            ...pos,
            background: "var(--n-950)",
            color: "var(--n-25)",
            font: "var(--text-caption)",
            padding: "5px 8px",
            borderRadius: "var(--radius-xs)",
            whiteSpace: "nowrap",
            boxShadow: "var(--shadow-md)",
            zIndex: 20,
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
