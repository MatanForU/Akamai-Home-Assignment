import type { Area, Severity, IssueType, RecommendedAction } from "../lib/types";
import { ISSUE_TYPE_LABELS, ISSUE_TYPE_ICONS, ACTION_LABELS, ACTION_DOT } from "../lib/scoring";
import { Badge } from "../design-system/components/Badge";

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge tone={severity}>{severity}</Badge>;
}

const AREA_DOT: Record<Area, string> = {
  Pet: "bg-amber-500",
  Store: "bg-red-500",
  User: "bg-indigo-500",
};

export function AreaBadge({ area }: { area: Area }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
      <span className={`h-1.5 w-1.5 rounded-full ${AREA_DOT[area]} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
      {area}
    </span>
  );
}

export function IssueTypeBadge({ issueType }: { issueType: IssueType }) {
  const Icon = ISSUE_TYPE_ICONS[issueType];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
      <Icon className="h-3 w-3 shrink-0" />
      {ISSUE_TYPE_LABELS[issueType]}
    </span>
  );
}

export function ActionBadge({ action }: { action: RecommendedAction }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ACTION_DOT[action]}`} />
      {ACTION_LABELS[action]}
    </span>
  );
}

const METHOD_STYLES: Record<string, string> = {
  GET: "text-blue-600 bg-blue-500/10 ring-1 ring-inset ring-blue-500/20",
  POST: "text-emerald-600 bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20",
  PUT: "text-amber-600 bg-amber-500/10 ring-1 ring-inset ring-amber-500/20",
  PATCH: "text-amber-600 bg-amber-500/10 ring-1 ring-inset ring-amber-500/20",
  DELETE: "text-red-600 bg-red-500/10 ring-1 ring-inset ring-red-500/20",
};

export function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={`inline-flex w-16 justify-center rounded px-1.5 py-0.5 font-mono text-xs font-bold ${
        METHOD_STYLES[method] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {method}
    </span>
  );
}
