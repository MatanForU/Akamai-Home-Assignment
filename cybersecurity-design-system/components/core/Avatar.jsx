import React from "react";

const SIZES = { sm: 24, md: 32, lg: 40 };

export function Avatar({ name = "", size = "md", src }) {
  const dim = SIZES[size] || 32;
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      style={{
        width: dim,
        height: dim,
        borderRadius: "50%",
        background: src ? "transparent" : "var(--accent-primary-bg)",
        color: "var(--accent-primary)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        font: "600 " + Math.max(10, dim * 0.4) + "px/1 var(--font-sans)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {src ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </span>
  );
}
