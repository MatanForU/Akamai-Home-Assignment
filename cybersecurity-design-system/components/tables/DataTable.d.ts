export interface DataTableColumn {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  /** Render cell in mono (IDs, IPs, counts) */
  mono?: boolean;
  render?: (row: any) => React.ReactNode;
}
/**
 * @startingPoint section="Tables" subtitle="Classic dense data table with selection, badges & expandable rows" viewport="700x360"
 */
export interface DataTableProps {
  columns: DataTableColumn[];
  rows: Array<{ id: string | number; [key: string]: any }>;
  selectable?: boolean;
  expandable?: boolean;
  renderExpanded?: (row: any) => React.ReactNode;
  dense?: boolean;
  onRowClick?: (row: any) => void;
}
