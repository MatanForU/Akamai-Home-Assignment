import React from "react";

/**
 * Thin-stroke icon glyph sourced from the Lucide icon set (CDN, MIT licensed).
 * Pass any Lucide icon name in kebab-case, e.g. "shield-check", "alert-triangle".
 * Browse names at https://lucide.dev/icons
 */
export function Icon({ name, size = 16, color = "currentColor" }) {
  const url = `https://unpkg.com/lucide-static@latest/icons/${name}.svg`;
  return (
    <span
      role="img"
      aria-label={name}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: color,
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
