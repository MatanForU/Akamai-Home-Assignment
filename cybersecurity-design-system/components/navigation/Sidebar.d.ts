export interface SidebarItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  /** e.g. open critical alert count */
  badge?: number | string;
}
export interface SidebarProps {
  items: SidebarItem[];
  activeValue?: string;
  onSelect?: (value: string) => void;
  productName?: string;
  logo?: React.ReactNode;
}
