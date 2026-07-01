export interface NetworkNode {
  id: string;
  label: string;
  x: number;
  y: number;
  kind?: "hub" | "node";
  flagged?: boolean;
}
export interface NetworkEdge {
  from: string;
  to: string;
  flagged?: boolean;
}
/**
 * @startingPoint section="Charts" subtitle="Node/edge topology graph for service & traffic maps" viewport="700x260"
 */
export interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  width?: number;
  height?: number;
}
