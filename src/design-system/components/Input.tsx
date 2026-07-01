import React from "react";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  mono?: boolean;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon = null,
  error,
  disabled = false,
  size = "md",
  mono = false,
}: InputProps) {
  const h = size === "sm" ? 32 : 38;
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "var(--font-sans)" }}>
      {label && <span style={{ font: "var(--text-label)", color: "var(--fg-secondary)" }}>{label}</span>}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: h,
          padding: "0 10px",
          background: "var(--bg-surface)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-sm)",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {icon && <span style={{ color: "var(--fg-tertiary)", display: "flex" }}>{icon}</span>}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            width: "100%",
            color: "var(--fg-primary)",
            font: mono ? "var(--text-mono)" : "var(--text-body-sm)",
          }}
        />
      </div>
      {error && <span style={{ font: "var(--text-caption)", color: "var(--danger)" }}>{error}</span>}
    </label>
  );
}
