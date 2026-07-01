export interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  onClose?: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}
