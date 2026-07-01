/**
 * @startingPoint section="Charts" subtitle="Grid heatmap for activity, geo, or risk matrices" viewport="700x220"
 */
export interface HeatmapProps {
  rows: string[];
  cols: string[];
  /** values[rowIndex][colIndex] */
  values: number[][];
  cellSize?: number;
}
