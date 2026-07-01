/**
 * @startingPoint section="Cards" subtitle="Chart-in-a-card wrapper with title, subtitle, footer" viewport="700x280"
 */
export interface ChartCardProps {
  title: string;
  subtitle?: string;
  chart: React.ReactNode;
  footer?: React.ReactNode;
}
