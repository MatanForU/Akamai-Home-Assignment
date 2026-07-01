export interface CardTableRow {
  id: string | number;
  title?: string;
  [key: string]: any;
}
/**
 * @startingPoint section="Tables" subtitle="Card-based row list — mobile-friendly table alternative" viewport="700x260"
 */
export interface CardTableProps {
  rows: CardTableRow[];
  renderTitle?: (row: CardTableRow) => React.ReactNode;
  renderMeta?: (row: CardTableRow) => React.ReactNode;
  renderTrailing?: (row: CardTableRow) => React.ReactNode;
  onRowClick?: (row: CardTableRow) => void;
}
