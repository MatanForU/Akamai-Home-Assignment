import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight, Check, Filter, Search, SearchX, X } from "lucide-react";
import type { Area, Issue, Severity } from "../lib/types";
import { AREAS, SPEC_META, issues, matchScorePct } from "../lib/mockData";
import { formatRelativeTime, ISSUE_TYPE_LABELS, SEVERITY_ORDER } from "../lib/scoring";
import { MatchScoreRing } from "./MatchScoreRing";
import { SeverityDonut } from "./SeverityDonut";
import { ActionBadge, AreaBadge, MethodBadge, SeverityBadge } from "./Badges";
import { Input } from "../design-system/components/Input";

type SortKey = "risk" | "severity" | "traffic" | "lastSeen";
type SortDir = "asc" | "desc";

const SORT_COLUMNS: { key: SortKey; label: string }[] = [
  { key: "severity", label: "Severity" },
  { key: "traffic", label: "Traffic (7d)" },
  { key: "lastSeen", label: "Last seen" },
];

const SEVERITY_OPTIONS: Severity[] = ["critical", "high", "medium", "low"];

function areaRiskLabel(areaIssues: Issue[]): { label: string; classes: string; color: string } {
  if (areaIssues.length === 0)
    return { label: "No issues", classes: "bg-slate-50 text-slate-400 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700", color: "var(--n-300)" };
  const avg = areaIssues.reduce((s, i) => s + i.riskScore, 0) / areaIssues.length;
  if (avg >= 70) return { label: "Critical", classes: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400", color: "var(--sev-critical-500)" };
  if (avg >= 50) return { label: "High", classes: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400", color: "var(--sev-high-500)" };
  if (avg >= 30) return { label: "Medium", classes: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400", color: "var(--sev-medium-500)" };
  return { label: "Low", classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400", color: "var(--sev-low-500)" };
}

interface SelectionOptionsProps<T extends string> {
  value: T | null;
  onChange: (value: T | null) => void;
  options: readonly T[] | T[];
  placeholder: string;
  labelFormatter?: (value: T) => string;
}

function SelectionOptions<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  labelFormatter,
}: SelectionOptionsProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const displayLabel = value ? (labelFormatter ? labelFormatter(value) : value) : placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-control)] border pl-3.5 pr-5 py-2 text-xs font-medium transition-all duration-250 select-none min-w-[140px] ${
          value
            ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:border-indigo-500/50 dark:bg-indigo-950/30 dark:text-indigo-400"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50"
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-250 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-1.5 z-40 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg animate-scale-up dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className="flex w-full cursor-pointer items-center justify-between px-3.5 py-2 text-left text-xs font-medium text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <span>{placeholder}</span>
              {!value && <Check className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />}
            </button>
            {options.map((opt) => {
              const label = labelFormatter ? labelFormatter(opt) : opt;
              const isSelected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between px-3.5 py-2 text-left text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <span>{label}</span>
                  {isSelected && <Check className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function Overview({ onSelectIssue }: { onSelectIssue: (id: string) => void }) {
  const [areaFilter, setAreaFilter] = useState<Area | null>(null);
  const [severityFilter, setSeverityFilter] = useState<Severity | null>(null);
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
      .filter((i) => (severityFilter ? i.severity === severityFilter : true))
      .filter((i) => (q ? i.path.toLowerCase().includes(q) : true))
      .sort((a, b) => (sortDir === "desc" ? sortValue(b) - sortValue(a) : sortValue(a) - sortValue(b)));
  }, [areaFilter, severityFilter, query, sortKey, sortDir]);

  const severityCounts = useMemo(() => {
    const m = { critical: 0, high: 0, medium: 0, low: 0 } as Record<Severity, number>;
    for (const i of issues) m[i.severity] += 1;
    return m;
  }, []);

  const areaStats = useMemo(() => {
    const stats = AREAS.map((area) => {
      const areaIssues = issues.filter((i) => i.area === area);
      return { area, count: areaIssues.length, risk: areaRiskLabel(areaIssues) };
    });
    const maxCount = Math.max(...stats.map((s) => s.count), 1);
    return stats.map((s) => ({ ...s, barWidthPct: Math.max((s.count / maxCount) * 100, 6) }));
  }, []);

  const hasActiveFilters = Boolean(areaFilter || severityFilter || query);

  const clearAllFilters = () => {
    setAreaFilter(null);
    setSeverityFilter(null);
    setQuery("");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
      <div className="mb-5 animate-slide-up">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Comparing <span className="text-slate-900 dark:text-slate-200 font-bold">{SPEC_META.name}</span> against {SPEC_META.windowLabel.toLowerCase()} of production traffic
        </p>
      </div>

      {/* Top summary row */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3 animate-slide-up [animation-delay:100ms]">
        <div className="rounded-2xl border border-gray-100 bg-white/50 p-4 glass dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Spec vs Traffic</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">How closely the spec matches real traffic</p>
          </div>
          <div className="flex items-center gap-6">
            <MatchScoreRing pct={matchScorePct()} />
            <div>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 leading-tight">
                {SPEC_META.matchedEndpoints} / {SPEC_META.totalSpecEndpoints}
              </div>
              <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                endpoints align with observed traffic signatures.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white/50 p-4 glass dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Total Issues</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Breakdown by severity</p>
          </div>
          <div className="flex items-center justify-center">
            <SeverityDonut counts={severityCounts} active={severityFilter} onSelect={setSeverityFilter} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white/50 p-4 glass dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Risk Exposure by Area</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Select an area to focus priorities</p>
          </div>
          <div className="flex flex-col justify-center gap-3.5 overflow-y-auto" style={{ height: 148 }}>
            {areaStats.map(({ area, count, risk, barWidthPct }) => {
              const isActive = areaFilter === area;
              return (
                <button
                  key={area}
                  onClick={() => setAreaFilter(areaFilter === area ? null : area)}
                  className="flex shrink-0 items-center gap-3 text-left transition-all duration-300"
                >
                  <span className="w-14 shrink-0 truncate text-[11px] font-bold text-slate-700 dark:text-slate-200">{area}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${barWidthPct}%`,
                        background: risk.color,
                        opacity: areaFilter && !isActive ? 0.35 : 1,
                        outline: isActive ? "2px solid var(--accent-primary)" : "2px solid transparent",
                        outlineOffset: 1,
                      }}
                    />
                  </div>
                  <span className="w-4 shrink-0 text-right text-[11px] font-black text-slate-900 dark:text-white">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority queue */}
      <h2 className="mt-6 text-lg font-bold text-slate-900 dark:text-white animate-slide-up [animation-delay:300ms]">Endpoints</h2>
      <div className="mt-2 rounded-2xl border border-gray-100 bg-white/50 glass animate-slide-up [animation-delay:300ms] dark:border-slate-800/60 dark:bg-slate-900/50 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters</span>
            </div>

            <SelectionOptions
              value={areaFilter}
              onChange={setAreaFilter}
              options={AREAS}
              placeholder="All areas"
            />

            <SelectionOptions
              value={severityFilter}
              onChange={setSeverityFilter}
              options={SEVERITY_OPTIONS}
              placeholder="All severities"
              labelFormatter={(s) => s[0].toUpperCase() + s.slice(1)}
            />
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
                <th className="px-5 py-3">Endpoint</th>
                <th className="px-5 py-3">Area</th>
                <th className="px-5 py-3">Issue Type</th>
                {SORT_COLUMNS.map((col) => (
                  <th key={col.key} className="px-5 py-3">
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
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filtered.map((issue) => (
                <tr
                  key={issue.id}
                  onClick={() => onSelectIssue(issue.id)}
                  className="group cursor-pointer transition-all hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <MethodBadge method={issue.method} />
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                        {issue.path}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <AreaBadge area={issue.area} />
                  </td>
                  <td className="px-5 py-3 font-bold text-slate-500 dark:text-slate-400 text-[11px]">
                    {ISSUE_TYPE_LABELS[issue.issueType]}
                  </td>
                  <td className="px-5 py-3">
                    <SeverityBadge severity={issue.severity} />
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {issue.traffic7d.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {formatRelativeTime(issue.lastSeenMinutesAgo)}
                  </td>
                  <td className="px-5 py-3 text-right">
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

      <footer className="mt-8 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Showing {filtered.length} of {issues.length} detected patterns &middot; AI risk-scoring engine v4.2
        </p>
      </footer>
    </div>
  );
}
