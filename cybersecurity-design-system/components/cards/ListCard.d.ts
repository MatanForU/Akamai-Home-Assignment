export interface ListCardItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}
/**
 * @startingPoint section="Cards" subtitle="Compact ranked list card (top endpoints, top offenders)" viewport="700x220"
 */
export interface ListCardProps {
  title: string;
  items: ListCardItem[];
  viewAllLabel?: string;
}
