/**
 * @startingPoint section="Cards" subtitle="KPI card with big number, delta, and inline sparkline" viewport="700x180"
 */
export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: "success" | "danger" | "neutral";
  sparkline?: React.ReactNode;
  unit?: string;
}
