import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, Search, SearchX, X } from "lucide-react";
import type { Area, Issue, IssueType } from "../lib/types";
import { AREAS, SPEC_META, issues, matchScorePct } from "../lib/mockData";
import { formatRelativeTime, ISSUE_TYPE_LABELS, SEVERITY_ORDER } from "../lib/scoring";
import { MatchScoreRing } from "./MatchScoreRing";
import { ActionBadge, AreaBadge, MethodBadge, SeverityBadge } from "./Badges";
import { StatCard } from "../design-system/components/StatCard";
import { Input } from "../design-system/components/Input";

const ISSUE_TYPES: IssueType[] = ["shadowApi", "undocumentedParam", "staleParam", "paramMismatch", "ghostEndpoint"];

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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Spec <span className="text-indigo-600">vs</span> Traffic
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            Comparing <span className="text-slate-900 dark:text-slate-200 font-bold">{SPEC_META.name}</span> against {SPEC_META.windowLabel.toLowerCase()} of production traffic
          </p>
        </div>
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 rounded-full glass border-red-500/20 px-4 py-2 text-sm font-bold text-red-600 shadow-sm ring-1 ring-inset ring-red-500/20">
            <AlertTriangle className="h-4 w-4" />
            {criticalCount} critical issue{criticalCount > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Top summary row */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 animate-slide-up [animation-delay:100ms]">
        <div className="flex items-center gap-6 rounded-2xl border border-slate-200/60 bg-white/50 p-6 glass lg:col-span-4 dark:border-slate-800/60 dark:bg-slate-900/50">
          <MatchScoreRing pct={matchScorePct()} />
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Compliance</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {SPEC_META.matchedEndpoints} / {SPEC_META.totalSpecEndpoints}
            </div>
            <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              endpoints align with observed traffic signatures.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-5">
          {ISSUE_TYPES.map((t, idx) => (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? null : t)}
              className="text-left transition-all duration-300 hover-lift"
              style={{
                animationDelay: `${(idx + 2) * 50}ms`,
                borderRadius: "var(--radius-lg)",
                outline: typeFilter === t ? "2px solid var(--accent-primary)" : "2px solid transparent",
                outlineOffset: 2,
              }}
            >
              <StatCard
                label={ISSUE_TYPE_LABELS[t]}
                value={counts.get(t) ?? 0}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Risk heatmap by area */}
      <div className="mt-8 rounded-2xl border border-slate-200/60 bg-white/50 p-6 glass animate-slide-up [animation-delay:200ms] dark:border-slate-800/60 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Risk Exposure by Area</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Select an area to focus priorities</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {AREAS.map((area) => {
            const areaIssues = issues.filter((i) => i.area === area);
            const risk = areaRiskLabel(areaIssues);
            const isActive = areaFilter === area;
            return (
              <button
                key={area}
                onClick={() => setAreaFilter(areaFilter === area ? null : area)}
                className={`group relative rounded-xl border p-5 text-left transition-all duration-300 hover-lift ${
                  isActive
                    ? "border-indigo-600 ring-2 ring-indigo-600/10 bg-indigo-50/30 dark:bg-indigo-950/20"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{area}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter ${risk.classes}`}>
                    {risk.label}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {areaIssues.length}
                </div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Issues
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority queue */}
      <div className="mt-8 rounded-2xl border border-slate-200/60 bg-white/50 glass shadow-xl animate-slide-up [animation-delay:300ms] dark:border-slate-800/60 dark:bg-slate-900/50 overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Priority Queue</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">AI-ranked issues by severity, traffic, and risk</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" style={{ width: 256 }}>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search endpoints..."
                icon={<Search size={15} />}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors dark:text-indigo-400 dark:hover:bg-indigo-950/30"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:border-slate-800 dark:bg-slate-900/30">
                <th className="px-6 py-4">Endpoint</th>
                <th className="px-6 py-4">Area</th>
                <th className="px-6 py-4">Issue Type</th>
                {SORT_COLUMNS.map((col) => (
                  <th key={col.key} className="px-6 py-4">
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                    >
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === "desc" ? <ArrowDown className="h-3 w-3 text-indigo-500" /> : <ArrowUp className="h-3 w-3 text-indigo-500" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </button>
                  </th>
                ))}
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filtered.map((issue) => (
                <tr
                  key={issue.id}
                  onClick={() => onSelectIssue(issue.id)}
                  className="group cursor-pointer transition-all hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <MethodBadge method={issue.method} />
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                        {issue.path}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <AreaBadge area={issue.area} />
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px]">
                    {ISSUE_TYPE_LABELS[issue.issueType]}
                  </td>
                  <td className="px-6 py-4">
                    <SeverityBadge severity={issue.severity} />
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {issue.traffic7d.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {formatRelativeTime(issue.lastSeenMinutesAgo)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <ActionBadge action={issue.recommendedAction} />
                      <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white/50 dark:bg-slate-900/50">
              <SearchX className="h-10 w-10 mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">No results found</p>
              <button onClick={clearAllFilters} className="mt-2 text-xs font-bold text-indigo-500 hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-12 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Showing {filtered.length} of {issues.length} detected patterns &middot; AI risk-scoring engine v4.2
        </p>
      </footer>
    </div>
  );
}
