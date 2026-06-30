import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, Search, SearchX, X } from "lucide-react";
import type { Area, Issue, IssueType } from "../lib/types";
import { AREAS, SPEC_META, issues, matchScorePct } from "../lib/mockData";
import { ACTION_LABELS, formatRelativeTime, ISSUE_TYPE_LABELS, SEVERITY_ORDER } from "../lib/scoring";
import { MatchScoreRing } from "./MatchScoreRing";
import { ActionBadge, AreaBadge, MethodBadge, SeverityBadge } from "./Badges";

const ISSUE_TYPES: IssueType[] = ["shadow_api", "param_undocumented", "param_unused", "param_mismatch", "spec_only"];

type SortKey = "risk" | "severity" | "traffic" | "lastSeen";
type SortDir = "asc" | "desc";

const SORT_COLUMNS: { key: SortKey; label: string }[] = [
  { key: "severity", label: "Severity" },
  { key: "traffic", label: "Traffic (7d)" },
  { key: "lastSeen", label: "Last seen" },
];

function areaRiskLabel(areaIssues: Issue[]): { label: string; classes: string } {
  if (areaIssues.length === 0)
    return { label: "No issues", classes: "bg-slate-50 text-slate-400 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700" };
  const avg = areaIssues.reduce((s, i) => s + i.riskScore, 0) / areaIssues.length;
  if (avg >= 70) return { label: "Critical", classes: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" };
  if (avg >= 50) return { label: "High", classes: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400" };
  if (avg >= 30) return { label: "Medium", classes: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" };
  return { label: "Low", classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" };
}

export function Overview({ onSelectIssue }: { onSelectIssue: (id: string) => void }) {
  const [areaFilter, setAreaFilter] = useState<Area | null>(null);
  const [typeFilter, setTypeFilter] = useState<IssueType | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sortValue = (i: Issue): number => {
      switch (sortKey) {
        case "severity":
          return SEVERITY_ORDER[i.severity];
        case "traffic":
          return i.traffic7d;
        case "lastSeen":
          return -i.lastSeenMinutesAgo;
        case "risk":
        default:
          return i.riskScore;
      }
    };
    return issues
      .filter((i) => (areaFilter ? i.area === areaFilter : true))
      .filter((i) => (typeFilter ? i.issueType === typeFilter : true))
      .filter((i) => (q ? i.path.toLowerCase().includes(q) : true))
      .sort((a, b) => (sortDir === "desc" ? sortValue(b) - sortValue(a) : sortValue(a) - sortValue(b)));
  }, [areaFilter, typeFilter, query, sortKey, sortDir]);

  const counts = useMemo(() => {
    const m = new Map<IssueType, number>();
    for (const t of ISSUE_TYPES) m.set(t, 0);
    for (const i of issues) m.set(i.issueType, (m.get(i.issueType) ?? 0) + 1);
    return m;
  }, []);

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const hasActiveFilters = Boolean(areaFilter || typeFilter || query);

  const clearAllFilters = () => {
    setAreaFilter(null);
    setTypeFilter(null);
    setQuery("");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Spec vs. Traffic Comparison</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {SPEC_META.name} &middot; uploaded {SPEC_META.uploadedAt} &middot; compared against {SPEC_META.windowLabel.toLowerCase()} of production traffic
          </p>
        </div>
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30">
            <AlertTriangle className="h-4 w-4" />
            {criticalCount} critical issue{criticalCount > 1 ? "s" : ""} need attention
          </div>
        )}
      </div>

      {/* Top summary row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4 dark:border-slate-800 dark:bg-slate-900">
          <MatchScoreRing pct={matchScorePct()} />
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Spec match score</div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {SPEC_META.matchedEndpoints} of {SPEC_META.totalSpecEndpoints} spec endpoints align with observed traffic.
            </div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{SPEC_META.totalObservedEndpoints} endpoints observed in traffic.</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-5">
          {ISSUE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? null : t)}
              aria-pressed={typeFilter === t}
              className={`rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-indigo-400 ${
                typeFilter === t
                  ? "border-slate-900 bg-slate-900 text-white dark:border-indigo-500 dark:bg-indigo-600"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              }`}
            >
              <div className={`text-2xl font-bold ${typeFilter === t ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>{counts.get(t)}</div>
              <div className={`mt-1 text-xs leading-snug ${typeFilter === t ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>{ISSUE_TYPE_LABELS[t]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Risk heatmap by area */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Risk by area</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Click an area to focus the priority queue below.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {AREAS.map((area) => {
            const areaIssues = issues.filter((i) => i.area === area);
            const risk = areaRiskLabel(areaIssues);
            const isActive = areaFilter === area;
            return (
              <button
                key={area}
                onClick={() => setAreaFilter(areaFilter === area ? null : area)}
                aria-pressed={isActive}
                className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-indigo-400 ${
                  isActive
                    ? "border-slate-900 ring-1 ring-slate-900 dark:border-indigo-500 dark:ring-indigo-500"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{area}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${risk.classes}`}>{risk.label}</span>
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {areaIssues.length} issue{areaIssues.length === 1 ? "" : "s"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority queue */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Priority queue</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Ranked by combined risk: issue type, area sensitivity, traffic volume, recency.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by path&hellip;"
                aria-label="Search by endpoint path"
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 sm:w-56 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="whitespace-nowrap text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400 dark:border-slate-800 dark:text-slate-500">
                <th className="px-5 py-2 font-medium">Endpoint</th>
                <th className="px-5 py-2 font-medium">Area</th>
                <th className="px-5 py-2 font-medium">Issue</th>
                {SORT_COLUMNS.map((col) => (
                  <th key={col.key} className="px-5 py-2 font-medium">
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === "desc" ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUp className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </button>
                  </th>
                ))}
                <th className="px-5 py-2 font-medium">Suggested action</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((issue) => (
                <tr
                  key={issue.id}
                  onClick={() => onSelectIssue(issue.id)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectIssue(issue.id);
                    }
                  }}
                  className="cursor-pointer border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none dark:border-slate-800/60 dark:hover:bg-slate-800/50 dark:focus-visible:bg-slate-800/50"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <MethodBadge method={issue.method} />
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{issue.path}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <AreaBadge area={issue.area} />
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-400">{ISSUE_TYPE_LABELS[issue.issueType]}</td>
                  <td className="px-5 py-3">
                    <SeverityBadge severity={issue.severity} />
                  </td>
                  <td className="px-5 py-3 text-xs tabular-nums text-slate-600 dark:text-slate-400">{issue.traffic7d.toLocaleString()}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{formatRelativeTime(issue.lastSeenMinutesAgo)}</td>
                  <td className="px-5 py-3">
                    <ActionBadge action={issue.recommendedAction} />
                  </td>
                  <td className="px-3 py-3 text-slate-300 dark:text-slate-600">
                    <ChevronRight className="h-4 w-4" />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                      <SearchX className="h-6 w-6" />
                      <span className="text-sm">No issues match the current filters.</span>
                      {hasActiveFilters && (
                        <button onClick={clearAllFilters} className="text-xs font-medium text-slate-500 underline hover:text-slate-900 dark:hover:text-slate-200">
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
        {filtered.length} of {issues.length} issues shown &middot; sorted by {sortKey === "risk" ? "risk" : SORT_COLUMNS.find((c) => c.key === sortKey)?.label.toLowerCase()} &middot;{" "}
        {ACTION_LABELS.investigate} actions require analyst review
      </p>
    </div>
  );
}
