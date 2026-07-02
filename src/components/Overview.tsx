import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAnchoredMenu } from "../lib/useAnchoredMenu";
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, ChevronDown, ChevronRight, Check, Search, SearchX, X, type LucideIcon } from "lucide-react";
import type { Area, Issue, IssueType, RecommendedAction } from "../lib/types";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";


const METHOD_DOT: Record<Method, string> = {
  GET: "bg-blue-500",
  POST: "bg-emerald-500",
  PUT: "bg-amber-500",
  PATCH: "bg-amber-400",
  DELETE: "bg-red-500",
};

const METHOD_OPTIONS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
import { AREAS, SPEC_META, issues } from "../lib/mockData";

import { formatRelativeTime, formatCompactNumber, ISSUE_TYPE_LABELS, ISSUE_TYPE_ICONS, ACTION_DOT, SEVERITY_ORDER } from "../lib/scoring";
import { MatchScoreRing } from "./MatchScoreRing";
import { ActionBadge, MethodBadge } from "./Badges";
import { Input } from "../design-system/components/Input";
import { Tooltip } from "../design-system/components/Tooltip";

type SortKey = "risk" | "severity" | "traffic" | "lastSeen";
type SortDir = "asc" | "desc";

const SORT_COLUMNS: { key: SortKey; label: string }[] = [
  { key: "severity", label: "Severity" },
  { key: "traffic", label: "Traffic (7d)" },
  { key: "lastSeen", label: "Last seen" },
];

const ISSUE_TYPE_OPTIONS: IssueType[] = ["shadowApi", "ghostEndpoint", "undocumentedParam", "staleParam", "paramMismatch"];

const SPEC_ISSUE_TYPES: IssueType[] = ["paramMismatch", "undocumentedParam", "staleParam", "ghostEndpoint"];

const WINDOW_OPTIONS: { minutes: number; label: string }[] = [
  { minutes: 60 * 24, label: "Last 24 hours" },
  { minutes: 60 * 24 * 3, label: "Last 3 days" },
  { minutes: 60 * 24 * 5, label: "Last 5 days" },
  { minutes: 60 * 24 * 7, label: "Last 7 days" },
];

const ACTION_META = [
  { action: "investigate" as const, label: "Investigate",        color: "#ef4444" },
  { action: "notify_dev"  as const, label: "Notify Developer",   color: "#6366f1" },
  { action: "update_spec" as const, label: "Update Spec",        color: "#10b981" },
  { action: "no_action"   as const, label: "No Action Needed",   color: "#94a3b8" },
];

type ActionKey = (typeof ACTION_META)[number]["action"];

const ACTION_OPTIONS: ActionKey[] = ACTION_META.map((m) => m.action);
const ACTION_LABELS: Record<ActionKey, string> = Object.fromEntries(ACTION_META.map((m) => [m.action, m.label])) as Record<ActionKey, string>;

interface MultiSelectOptionsProps<T extends string> {
  values: T[];
  onChange: (values: T[]) => void;
  options: readonly T[] | T[];
  placeholder: string;
  labelFormatter?: (value: T) => string;
  dotColorFn?: (value: T) => string;
  iconFn?: (value: T) => LucideIcon;
  countFn?: (value: T) => number;
}

function MultiSelectOptions<T extends string>({
  values,
  onChange,
  options,
  placeholder,
  labelFormatter,
  dotColorFn,
  iconFn,
  countFn,
}: MultiSelectOptionsProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const { anchorRef, rect } = useAnchoredMenu(isOpen);

  const toggle = (opt: T) => {
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);
  };

  const hasSelection = values.length > 0;

  let displayLabel: string;
  if (values.length === 0) displayLabel = placeholder;
  else if (values.length === 1) displayLabel = labelFormatter ? labelFormatter(values[0]) : values[0];
  else displayLabel = `${values.length} selected`;

  return (
    <div className="relative">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border px-3.5 py-2 text-xs font-medium transition-all duration-250 select-none min-w-[130px] ${
          hasSelection
            ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:border-indigo-500/50 dark:bg-indigo-950/30 dark:text-indigo-400"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50"
        }`}
      >
        <span className="flex flex-1 items-center gap-1.5 truncate">
          {values.length === 1 && dotColorFn && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColorFn(values[0])}`} />}
          {displayLabel}
        </span>
        {hasSelection && (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-black text-white dark:bg-indigo-500">
            {values.length}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-250 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && rect && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="fixed z-50 w-64 rounded-xl border border-slate-200 bg-white py-1 shadow-lg animate-scale-up dark:border-slate-800 dark:bg-slate-900"
            style={{ top: rect.bottom + 6, left: rect.left }}
          >
            {options.map((opt) => {
              const label = labelFormatter ? labelFormatter(opt) : opt;
              const isSelected = values.includes(opt);
              const Icon = iconFn ? iconFn(opt) : null;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-2 px-3.5 py-2 text-left text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    {dotColorFn && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColorFn(opt)}`} />}
                    {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                    <span className="whitespace-nowrap">{label}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {countFn && <span className="text-[10px] font-semibold tabular-nums text-slate-400">{countFn(opt)}</span>}
                    <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
                      isSelected ? "border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-400" : "border-slate-300 dark:border-slate-600"
                    }`}>
                      {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                    </span>
                  </span>
                </button>
              );
            })}
            {hasSelection && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="flex w-full cursor-pointer items-center justify-between border-t border-slate-100 px-3.5 py-2 text-left text-xs font-medium text-slate-400 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
              >
                <span>Clear all</span>
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

function WindowPicker({ value, onChange }: { value: number; onChange: (minutes: number) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { anchorRef, rect } = useAnchoredMenu(isOpen);
  const current = WINDOW_OPTIONS.find((o) => o.minutes === value) ?? WINDOW_OPTIONS[WINDOW_OPTIONS.length - 1];

  return (
    <div className="relative">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 transition-all duration-250 select-none hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50"
      >
        <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        {current.label}
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-250 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && rect && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="fixed z-50 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg animate-scale-up dark:border-slate-800 dark:bg-slate-900"
            style={{ top: rect.bottom + 6, left: rect.right - 176 }}
          >
            {WINDOW_OPTIONS.map((opt) => (
              <button
                key={opt.minutes}
                type="button"
                onClick={() => {
                  onChange(opt.minutes);
                  setIsOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between px-3.5 py-2 text-left text-xs font-medium transition-colors ${
                  opt.minutes === value
                    ? "bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                }`}
              >
                {opt.label}
                {opt.minutes === value && <Check className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export function Overview({
  onSelectIssue,
  onVisibleIssuesChange,
  resolvedActions = {},
}: {
  onSelectIssue: (id: string) => void;
  onVisibleIssuesChange?: (ids: string[]) => void;
  resolvedActions?: Record<string, RecommendedAction>;
}) {
  // A determination made in the drawer overrides the system's recommended
  // action everywhere the table cares about "what action applies to this
  // issue" — the Action column, its filter, and its facet counts — so
  // resolving an issue actually moves it, rather than just relabeling a
  // badge that then disagrees with the filters around it.
  const effectiveAction = (i: Issue): ActionKey => (resolvedActions[i.id] ?? i.recommendedAction) as ActionKey;

  const [areaFilter, setAreaFilter] = useState<Area[]>([]);
  const [methodFilter, setMethodFilter] = useState<Method[]>([]);
  const [issueTypeFilter, setIssueTypeFilter] = useState<IssueType[]>([]);
  const [actionFilter, setActionFilter] = useState<ActionKey[]>([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [windowMinutes, setWindowMinutes] = useState<number>(WINDOW_OPTIONS[WINDOW_OPTIONS.length - 1].minutes);
  const tableRef = useRef<HTMLDivElement>(null);

  // Issues observed within the selected lookback window. Narrowing the window
  // (e.g. 3 days instead of 7) surfaces recent activity that could otherwise
  // get buried among everything seen across the full retention period.
  // Applies uniformly to every issue type, including ghost endpoints — same
  // rule as every other filter, no special-casing.
  const windowedIssues = useMemo(
    () => issues.filter((i) => i.lastSeenMinutesAgo <= windowMinutes),
    [windowMinutes]
  );

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filterByAction = (action: ActionKey) => {
    setActionFilter((prev) => (prev.includes(action) ? prev.filter((a) => a !== action) : [action]));
    scrollToTable();
  };

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
    return windowedIssues
      .filter((i) => (areaFilter.length > 0 ? areaFilter.includes(i.area) : true))
      .filter((i) => (methodFilter.length > 0 ? methodFilter.includes(i.method as Method) : true))
      .filter((i) => (issueTypeFilter.length > 0 ? issueTypeFilter.includes(i.issueType) : true))
      .filter((i) => (actionFilter.length > 0 ? actionFilter.includes(effectiveAction(i)) : true))
      .filter((i) => (q ? i.path.toLowerCase().includes(q) : true))
      .sort((a, b) => (sortDir === "desc" ? sortValue(b) - sortValue(a) : sortValue(a) - sortValue(b)));
  }, [windowedIssues, areaFilter, methodFilter, issueTypeFilter, actionFilter, query, sortKey, sortDir, resolvedActions]);

  // Reports the currently visible (filtered + sorted) row order up to the
  // parent, so the investigation drawer can offer "next/previous" navigation
  // through exactly what's on screen right now, not just raw dataset order.
  useEffect(() => {
    onVisibleIssuesChange?.(filtered.map((i) => i.id));
  }, [filtered, onVisibleIssuesChange]);

  // Per-option counts shown inside each filter dropdown. Each dropdown's
  // counts are computed from every *other* active filter (area/method/
  // issue-type/action/search/date window) but deliberately excludes its own
  // filter, so a row's number always answers "how many would I get if I
  // also picked this," rather than zeroing out once you've made a selection.
  const facetCounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = windowedIssues.filter((i) => (q ? i.path.toLowerCase().includes(q) : true));

    const areaBase = base
      .filter((i) => (methodFilter.length > 0 ? methodFilter.includes(i.method as Method) : true))
      .filter((i) => (issueTypeFilter.length > 0 ? issueTypeFilter.includes(i.issueType) : true))
      .filter((i) => (actionFilter.length > 0 ? actionFilter.includes(effectiveAction(i)) : true));

    const methodBase = base
      .filter((i) => (areaFilter.length > 0 ? areaFilter.includes(i.area) : true))
      .filter((i) => (issueTypeFilter.length > 0 ? issueTypeFilter.includes(i.issueType) : true))
      .filter((i) => (actionFilter.length > 0 ? actionFilter.includes(effectiveAction(i)) : true));

    const issueTypeBase = base
      .filter((i) => (areaFilter.length > 0 ? areaFilter.includes(i.area) : true))
      .filter((i) => (methodFilter.length > 0 ? methodFilter.includes(i.method as Method) : true))
      .filter((i) => (actionFilter.length > 0 ? actionFilter.includes(effectiveAction(i)) : true));

    const actionBase = base
      .filter((i) => (areaFilter.length > 0 ? areaFilter.includes(i.area) : true))
      .filter((i) => (methodFilter.length > 0 ? methodFilter.includes(i.method as Method) : true))
      .filter((i) => (issueTypeFilter.length > 0 ? issueTypeFilter.includes(i.issueType) : true));

    const tally = <K extends string>(list: Issue[], key: (i: Issue) => K): Partial<Record<K, number>> => {
      const counts: Partial<Record<K, number>> = {};
      for (const i of list) {
        const k = key(i);
        counts[k] = (counts[k] ?? 0) + 1;
      }
      return counts;
    };

    return {
      area: tally(areaBase, (i) => i.area),
      method: tally(methodBase, (i) => i.method as Method),
      issueType: tally(issueTypeBase, (i) => i.issueType),
      action: tally(actionBase, (i) => effectiveAction(i)),
    };
  }, [windowedIssues, areaFilter, methodFilter, issueTypeFilter, actionFilter, query, resolvedActions]);

  // The overview stat strip is driven by `filtered` rather than `windowedIssues`
  // so that the area/method/issue-type/action/search filters — not just the
  // date picker — move the banner numbers too, same as they move the table.
  const totalTraffic = useMemo(
    () => filtered.reduce((sum, i) => sum + i.traffic7d, 0),
    [filtered]
  );

  const visibleAreaCount = useMemo(
    () => new Set(filtered.map((i) => i.area)).size,
    [filtered]
  );

  // Spec-vs-traffic match is normally an existence check over the full spec,
  // but the user wants the whole screen to move with the filters (date
  // picker included), so we derive a filter-aware version here: an endpoint
  // counts as "matched" as long as none of its currently-visible issues
  // affect it. Shadow APIs are excluded from this count since they're extra
  // activity outside the spec, not a spec endpoint failing to match.
  const matchedInWindow = useMemo(() => {
    const affected = new Set(
      filtered.filter((i) => SPEC_ISSUE_TYPES.includes(i.issueType)).map((i) => `${i.method} ${i.path}`)
    );
    return Math.max(SPEC_META.totalSpecEndpoints - affected.size, 0);
  }, [filtered]);
  const matchPctInWindow = Math.round((matchedInWindow / SPEC_META.totalSpecEndpoints) * 100);

  // These three widgets now key off `filtered` (every active filter) rather
  // than `windowedIssues` (date only), so they stay consistent with the stat
  // strip and the table below — narrowing by area/method/issue-type/action/
  // search moves everything on the page together.
  const topTrafficIssues = useMemo(
    () => [...filtered].sort((a, b) => b.traffic7d - a.traffic7d).slice(0, 5),
    [filtered]
  );

  const recentIssues = useMemo(
    () => [...filtered].sort((a, b) => a.lastSeenMinutesAgo - b.lastSeenMinutesAgo).slice(0, 5),
    [filtered]
  );

  const actionCounts = useMemo(
    () => ACTION_META.map((m) => ({ ...m, count: filtered.filter((i) => effectiveAction(i) === m.action).length })),
    [filtered, resolvedActions]
  );

  const hasActiveFilters = Boolean(areaFilter.length || methodFilter.length || issueTypeFilter.length || actionFilter.length || query);

  const clearAllFilters = () => {
    setAreaFilter([]);
    setMethodFilter([]);
    setIssueTypeFilter([]);
    setActionFilter([]);
    setQuery("");
  };

  return (
    <div className="mx-auto max-w-[1680px] px-6 py-5 sm:px-10 xl:px-12">
      <div className="mb-5 animate-slide-up">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Endpoints</h1>
      </div>

      {/* Filter bar — sticky so filtering stays reachable while scrolling the page */}
      <div className="sticky top-16 z-20 mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white/95 px-5 py-3 shadow-xs backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/95">
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

        <MultiSelectOptions
          values={areaFilter}
          onChange={setAreaFilter}
          options={AREAS}
          placeholder="All areas"
          countFn={(a: Area) => facetCounts.area[a] ?? 0}
        />

        <MultiSelectOptions
          values={methodFilter}
          onChange={setMethodFilter}
          options={METHOD_OPTIONS}
          placeholder="All methods"
          dotColorFn={(m) => METHOD_DOT[m]}
          countFn={(m: Method) => facetCounts.method[m] ?? 0}
        />

        <MultiSelectOptions
          values={issueTypeFilter}
          onChange={setIssueTypeFilter}
          options={ISSUE_TYPE_OPTIONS}
          placeholder="All issue types"
          labelFormatter={(t: IssueType) => ISSUE_TYPE_LABELS[t]}
          iconFn={(t: IssueType) => ISSUE_TYPE_ICONS[t]}
          countFn={(t: IssueType) => facetCounts.issueType[t] ?? 0}
        />

        <MultiSelectOptions
          values={actionFilter}
          onChange={setActionFilter}
          options={ACTION_OPTIONS}
          placeholder="All required actions"
          labelFormatter={(a: ActionKey) => ACTION_LABELS[a]}
          dotColorFn={(a) => ACTION_DOT[a]}
          countFn={(a: ActionKey) => facetCounts.action[a] ?? 0}
        />

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="cursor-pointer rounded-[8px] px-4 py-2.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors dark:text-indigo-400 dark:hover:bg-indigo-950/30"
          >
            Reset
          </button>
        )}

        <div className="ml-auto">
          <WindowPicker value={windowMinutes} onChange={setWindowMinutes} />
        </div>
      </div>

      {/* Top summary strip */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 animate-slide-up [animation-delay:100ms]">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/50 py-4 pl-8 pr-4 glass dark:border-slate-800/60 dark:bg-slate-900/50">
          <MatchScoreRing pct={matchPctInWindow} size={104} />
          <div>
            <div className="text-4xl font-extrabold leading-none text-slate-900 dark:text-white">
              {formatCompactNumber(matchedInWindow)} / {formatCompactNumber(SPEC_META.totalSpecEndpoints)}
            </div>
            <div className="mt-2 text-base font-medium text-slate-500 dark:text-slate-400">Matched to spec</div>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-2xl border border-gray-100 bg-white/50 py-4 pl-8 pr-4 glass dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="text-4xl font-extrabold leading-none text-slate-900 dark:text-white">{formatCompactNumber(SPEC_META.totalSpecEndpoints)}</div>
          <div className="mt-2 text-base font-medium text-slate-500 dark:text-slate-400">Endpoints</div>
        </div>
        <div className="flex flex-col justify-center rounded-2xl border border-gray-100 bg-white/50 py-4 pl-8 pr-4 glass dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="text-4xl font-extrabold leading-none text-slate-900 dark:text-white">{formatCompactNumber(filtered.length)}</div>
          <div className="mt-2 text-base font-medium text-slate-500 dark:text-slate-400">Issues</div>
        </div>
        <div className="flex flex-col justify-center rounded-2xl border border-gray-100 bg-white/50 py-4 pl-8 pr-4 glass dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="text-4xl font-extrabold leading-none text-slate-900 dark:text-white">{formatCompactNumber(visibleAreaCount)}</div>
          <div className="mt-2 text-base font-medium text-slate-500 dark:text-slate-400">Areas</div>
        </div>
        <div className="flex flex-col justify-center rounded-2xl border border-gray-100 bg-white/50 py-4 pl-8 pr-4 glass dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="text-4xl font-extrabold leading-none text-slate-900 dark:text-white">{formatCompactNumber(totalTraffic)}</div>
          <div className="mt-2 text-base font-medium text-slate-500 dark:text-slate-400">Requests</div>
        </div>
      </div>

      {/* Second widget row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3 animate-slide-up [animation-delay:200ms]">

        {/* High Traffic Endpoints */}
        <div className="rounded-2xl border border-gray-100 bg-white/50 p-4 glass dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">High Traffic with Issues</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Top endpoints by request volume</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {topTrafficIssues.map((issue) => {
              const maxT = topTrafficIssues[0].traffic7d;
              const IssueIcon = ISSUE_TYPE_ICONS[issue.issueType];
              return (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => onSelectIssue(issue.id)}
                  title={`Investigate ${issue.method} ${issue.path}`}
                  className="group relative w-full cursor-pointer rounded-[8px] bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-left border border-transparent transition-all hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-sm hover:-translate-y-px active:translate-y-0 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
                >
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 rounded-l-[8px] bg-indigo-100/60 dark:bg-indigo-900/20 transition-all" style={{ width: `${(issue.traffic7d / maxT) * 100}%` }} />
                  </div>
                  <div className="relative flex items-center gap-2">
                    <MethodBadge method={issue.method} />
                    <span className="font-mono text-[11px] font-medium text-slate-700 dark:text-slate-300 flex-1 truncate">{issue.path}</span>
                    <Tooltip label={ISSUE_TYPE_LABELS[issue.issueType]}>
                      <IssueIcon className="h-3.5 w-3.5 shrink-0 text-indigo-500/80 dark:text-indigo-300/80" />
                    </Tooltip>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 shrink-0">{issue.traffic7d.toLocaleString()}<span className="text-[9px] font-medium text-slate-400 ml-0.5">req</span></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-gray-100 bg-white/50 p-4 glass dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Endpoints with latest observed traffic</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {recentIssues.map((issue) => {
              const isVeryRecent = issue.lastSeenMinutesAgo < 5;
              const isRecent = issue.lastSeenMinutesAgo < 60;
              const timeColor = isVeryRecent ? "text-emerald-600 dark:text-emerald-400" : isRecent ? "text-amber-600 dark:text-amber-400" : "text-slate-400";
              return (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => onSelectIssue(issue.id)}
                  title={`Investigate ${issue.method} ${issue.path}`}
                  className="group flex w-full cursor-pointer items-center gap-2 rounded-[8px] bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-left border border-transparent transition-all hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-sm hover:-translate-y-px active:translate-y-0 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
                >
                  <MethodBadge method={issue.method} />
                  <span className="font-mono text-[11px] font-medium text-slate-700 dark:text-slate-300 flex-1 truncate">{issue.path}</span>
                  <span className={`text-[11px] font-bold shrink-0 ${timeColor}`}>{formatRelativeTime(issue.lastSeenMinutesAgo)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Breakdown */}
        <div className="rounded-2xl border border-gray-100 bg-white/50 p-4 glass dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Required Actions</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Distribution of recommended next steps</p>
          </div>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full mb-4">
            {actionCounts.filter((a) => a.count > 0).map((a) => (
              <div key={a.action} className="h-full transition-all" style={{ width: `${(a.count / windowedIssues.length) * 100}%`, background: a.color }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {actionCounts.map((a) => {
              const isActive = actionFilter.includes(a.action);
              return (
                <button
                  key={a.action}
                  type="button"
                  onClick={() => filterByAction(a.action)}
                  title={`View issues marked "${a.label}"`}
                  className="cursor-pointer rounded-[8px] border border-transparent p-3 text-left transition-all hover:border-[var(--tile-border)] hover:shadow-md hover:-translate-y-px active:translate-y-0 hover:brightness-95 dark:hover:brightness-110"
                  style={{ background: a.color + "18", "--tile-border": a.color, ...(isActive ? { boxShadow: `inset 0 0 0 2px ${a.color}` } : {}) } as React.CSSProperties}
                >
                  <div className="text-2xl font-extrabold leading-none mb-1" style={{ color: a.color }}>{a.count}</div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">{a.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority queue */}
      <div ref={tableRef} className="mt-6 scroll-mt-36 rounded-2xl border border-gray-100 bg-white/50 glass animate-slide-up [animation-delay:300ms] dark:border-slate-800/60 dark:bg-slate-900/50 overflow-hidden">
        {/* Column headers */}
        <div
          className="grid border-b border-slate-100 bg-slate-50/50 px-7 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:border-slate-800 dark:bg-slate-900/30"
          style={{ gridTemplateColumns: "3fr 2fr 1.2fr 1.2fr 160px" }}
        >
          <span className="flex items-center py-2.5">Endpoint &amp; Area</span>
          <span className="flex items-center">Issue Type</span>
          {SORT_COLUMNS.filter((c) => c.key !== "severity").map((col) => (
            <button
              key={col.key}
              onClick={() => toggleSort(col.key)}
              className="flex items-center gap-1 uppercase tracking-widest hover:text-slate-700 dark:hover:text-white"
            >
              {col.label}
              {sortKey === col.key ? (
                sortDir === "desc" ? <ArrowDown className="h-3 w-3 text-indigo-500" /> : <ArrowUp className="h-3 w-3 text-indigo-500" />
              ) : (
                <ArrowUpDown className="h-3 w-3 opacity-30" />
              )}
            </button>
          ))}
          <span className="flex items-center justify-end">Action</span>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-2 p-3">
          {filtered.map((issue) => {
            const IssueIcon = ISSUE_TYPE_ICONS[issue.issueType];
            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue.id)}
                className="group grid cursor-pointer items-center rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
                style={{ gridTemplateColumns: "3fr 2fr 1.2fr 1.2fr 160px" }}
              >
                  {/* Col 1: method centered beside [path / area] */}
                  <div className="flex items-center gap-2 pr-4">
                    <MethodBadge method={issue.method} />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{issue.path}</span>
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{issue.area}</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <IssueIcon className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                    {ISSUE_TYPE_LABELS[issue.issueType]}
                  </span>
                  <span className="font-mono text-[11px] font-medium text-slate-600 dark:text-slate-400">{issue.traffic7d.toLocaleString()} req</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{formatRelativeTime(issue.lastSeenMinutesAgo)}</span>
                  <div className="flex items-center justify-end gap-2">
                    <ActionBadge action={effectiveAction(issue)} />
                    <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" />
                  </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <SearchX className="h-10 w-10 mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">No results found</p>
              <button onClick={clearAllFilters} className="mt-2 text-xs font-bold text-indigo-500 hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
