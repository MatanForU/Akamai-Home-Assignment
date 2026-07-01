export interface BarChartDatum {
  label: string;
  value: number;
  color?: string;
}
/**
 * @startingPoint section="Charts" subtitle="Vertical bar chart for severity/risk distributions" viewport="700x260"
 */
export interface BarChartProps {
  data: BarChartDatum[];
  width?: number;
  height?: number;
  color?: string;
  colors?: string[];
}
