/**
 * @startingPoint section="Cards" subtitle="API/service/device inventory card with health status" viewport="700x150"
 */
export interface AssetCardProps {
  name: string;
  type: string;
  status?: "healthy" | "warning" | "critical";
  endpointCount?: number;
  lastScanned?: string;
  icon?: React.ReactNode;
}
