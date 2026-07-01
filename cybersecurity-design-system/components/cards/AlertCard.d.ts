/**
 * @startingPoint section="Cards" subtitle="Severity-coded incident/alert row card" viewport="700x150"
 */
export interface AlertCardProps {
  severity?: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  meta?: string;
  timestamp?: string;
  actions?: React.ReactNode;
}
