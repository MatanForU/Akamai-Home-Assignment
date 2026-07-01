export interface IconButtonProps {
  icon: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** solid = subtle filled square, ghost = transparent until hover/active */
  variant?: "ghost" | "solid";
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  "aria-label": string;
}
