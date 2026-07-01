export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}
/**
 * @startingPoint section="Charts" subtitle="Donut chart with legend for category breakdowns" viewport="700x200"
 */
export interface DonutChartProps {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
}
