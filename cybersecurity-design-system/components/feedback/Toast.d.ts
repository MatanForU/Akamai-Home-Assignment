export interface ToastProps {
  tone?: "success" | "danger" | "info" | "warning";
  title: string;
  description?: string;
  onClose?: () => void;
}
