/**
 * @startingPoint section="Components" subtitle="Severity/status pill used in tables, cards, alerts" viewport="700x160"
 */
export interface BadgeProps {
  /** Maps to the severity/status color scale */
  tone?: "critical" | "high" | "medium" | "low" | "info" | "success" | "neutral";
  /** Small color dot before the label */
  dot?: boolean;
  children?: React.ReactNode;
}
