export interface ChartPoint {
  label: string;
  value: number;
}
/**
 * @startingPoint section="Charts" subtitle="Time-series line/area chart for threat volume, latency, traffic" viewport="700x260"
 */
export interface LineChartProps {
  data: ChartPoint[];
  width?: number;
  height?: number;
  color?: string;
  area?: boolean;
  showGrid?: boolean;
}
