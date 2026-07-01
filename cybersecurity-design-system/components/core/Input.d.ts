export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  /** Use mono for IP/token/ID entry fields */
  mono?: boolean;
}
