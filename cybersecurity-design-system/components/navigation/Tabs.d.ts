export interface TabItem {
  value: string;
  label: string;
  count?: number;
}
export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}
