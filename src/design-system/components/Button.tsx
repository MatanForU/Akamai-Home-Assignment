import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const SIZES: Record<ButtonSize, { padding: string; font: string; gap: number; h: number }> = {
  sm: { padding: "6px 12px",  font: "var(--text-button)", gap: 6, h: 30 },
  md: { padding: "9px 16px",  font: "var(--text-button)", gap: 7, h: 36 },
  lg: { padding: "12px 20px", font: "600 0.9375rem/1 var(--font-sans)", gap: 8, h: 44 },
};

const VARIANTS: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { background: "var(--accent-primary)", color: "var(--fg-on-brand)", border: "1px solid transparent" },
  secondary: { background: "var(--bg-surface)", color: "var(--fg-primary)", border: "1px solid var(--border-default)" },
  ghost:     { background: "transparent", color: "var(--fg-primary)", border: "1px solid transparent" },
  danger:    { background: "var(--danger)", color: "var(--n-0)", border: "1px solid transparent" },
};

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}

export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  iconLeft = null,
  iconRight = null,
  children,
  onClick,
  type = "button",
  style,
}: ButtonProps) {
  const s = SIZES[size];
  const v = VARIANTS[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        padding: s.padding,
        height: s.h,
        font: s.font,
        fontFamily: "var(--font-sans)",
        borderRadius: "var(--radius-sm)",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), opacity var(--duration-fast)",
        whiteSpace: "nowrap",
        ...v,
        ...style,
      }}
    >
      {loading ? (
        <span
          style={{
            width: 13, height: 13,
            borderRadius: "50%",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            animation: "ds-spin 0.7s linear infinite",
          }}
        />
      ) : iconLeft}
      {children && <span>{children}</span>}
      {!loading && iconRight}
      <style>{`@keyframes ds-spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
