import React from "react";

/**
 * @startingPoint section="Components" subtitle="Primary/secondary/ghost/danger action button" viewport="700x260"
 */
export interface ButtonProps {
  /** Visual style */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Height/padding preset */
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Shows a spinner in place of iconLeft, disables interaction */
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  style?: React.CSSProperties;
}
