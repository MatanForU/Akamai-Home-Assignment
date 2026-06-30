import type { Area, Severity, IssueType, RecommendedAction } from "../lib/types";
import { ISSUE_TYPE_LABELS, ACTION_LABELS } from "../lib/scoring";

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: "bg-red-500/10 text-red-600 ring-1 ring-inset ring-red-500/20 dark:bg-red-500/20 dark:text-red-400",
  high: "bg-orange-500/10 text-orange-600 ring-1 ring-inset ring-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400",
  medium: "bg-amber-500/10 text-amber-600 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400",
  low: "bg-slate-500/10 text-slate-600 ring-1 ring-inset ring-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight ${SEVERITY_STYLES[severity]}`}>
      {severity}
    </span>
  );
}

const AREA_DOT: Record<Area, string> = {
  Payments: "bg-red-500",
  Users: "bg-indigo-500",
  Orders: "bg-sky-500",
  Catalog: "bg-emerald-500",
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
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
      {ISSUE_TYPE_LABELS[issueType]}
    </span>
  );
}

const ACTION_STYLES: Record<RecommendedAction, string> = {
  investigate: "bg-red-500 text-white shadow-sm",
  notify_dev: "bg-indigo-500 text-white shadow-sm",
  update_spec: "bg-emerald-600 text-white shadow-sm",
  no_action: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-1 ring-inset ring-slate-200 dark:ring-slate-700",
};

export function ActionBadge({ action }: { action: RecommendedAction }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ACTION_STYLES[action]}`}>
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
