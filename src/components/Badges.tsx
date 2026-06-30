import type { Area, Severity, IssueType, RecommendedAction } from "../lib/types";
import { ISSUE_TYPE_LABELS, ACTION_LABELS } from "../lib/scoring";

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  high: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
  medium: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  low: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${SEVERITY_STYLES[severity]}`}>
      {severity}
    </span>
  );
}

const AREA_DOT: Record<Area, string> = {
  Payments: "bg-red-500",
  Users: "bg-violet-500",
  Orders: "bg-blue-500",
  Catalog: "bg-emerald-500",
};

export function AreaBadge({ area }: { area: Area }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
      <span className={`h-1.5 w-1.5 rounded-full ${AREA_DOT[area]}`} />
      {area}
    </span>
  );
}

export function IssueTypeBadge({ issueType }: { issueType: IssueType }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
      {ISSUE_TYPE_LABELS[issueType]}
    </span>
  );
}

const ACTION_STYLES: Record<RecommendedAction, string> = {
  investigate: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  notify_dev: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  update_spec: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
  no_action: "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200",
};

export function ActionBadge({ action }: { action: RecommendedAction }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${ACTION_STYLES[action]}`}>
      {ACTION_LABELS[action]}
    </span>
  );
}

const METHOD_STYLES: Record<string, string> = {
  GET: "text-blue-700 bg-blue-50",
  POST: "text-emerald-700 bg-emerald-50",
  PUT: "text-amber-700 bg-amber-50",
  PATCH: "text-amber-700 bg-amber-50",
  DELETE: "text-red-700 bg-red-50",
};

export function MethodBadge({ method }: { method: string }) {
  return (
    <span className={`inline-flex w-16 justify-center rounded px-1.5 py-0.5 font-mono text-xs font-bold ${METHOD_STYLES[method] ?? "bg-slate-100 text-slate-700"}`}>
      {method}
    </span>
  );
}
