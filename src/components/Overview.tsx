import { useMemo, useState } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import type { Area, Issue, IssueType } from "../lib/types";
import { AREAS, SPEC_META, issues, matchScorePct } from "../lib/mockData";
import { ACTION_LABELS, formatRelativeTime, ISSUE_TYPE_LABELS } from "../lib/scoring";
import { MatchScoreRing } from "./MatchScoreRing";
import { ActionBadge, AreaBadge, MethodBadge, SeverityBadge } from "./Badges";

const ISSUE_TYPES: IssueType[] = ["shadow_api", "param_undocumented", "param_unused", "param_mismatch", "spec_only"];

function areaRiskLabel(areaIssues: Issue[]): { label: string; classes: string } {
  if (areaIssues.length === 0) return { label: "No issues", classes: "bg-slate-50 text-slate-400 ring-1 ring-inset ring-slate-200" };
  const avg = areaIssues.reduce((s, i) => s + i.riskScore, 0) / areaIssues.length;
  if (avg >= 70) return { label: "Critical", classes: "bg-red-100 text-red-700" };
  if (avg >= 50) return { label: "High", classes: "bg-orange-100 text-orange-700" };
  if (avg >= 30) return { label: "Medium", classes: "bg-amber-100 text-amber-700" };
  return { label: "Low", classes: "bg-emerald-100 text-emerald-700" };
}

export function Overview({ onSelectIssue }: { onSelectIssue: (id: string) => void }) {
  const [areaFilter, setAreaFilter] = useState<Area | null>(null);
  const [typeFilter, setTypeFilter] = useState<IssueType | null>(null);

  const filtered = useMemo(() => {
    return issues
      .filter((i) => (areaFilter ? i.area === areaFilter : true))
      .filter((i) => (typeFilter ? i.issueType === typeFilter : true))
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [areaFilter, typeFilter]);

  const counts = useMemo(() => {
    const m = new Map<IssueType, number>();
    for (const t of ISSUE_TYPES) m.set(t, 0);
    for (const i of issues) m.set(i.issueType, (m.get(i.issueType) ?? 0) + 1);
    return m;
  }, []);

  const criticalCount = issues.filter((i) => i.severity === "critical").length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Spec vs. Traffic Comparison</h1>
          <p className="mt-1 text-sm text-slate-500">
            {SPEC_META.name} &middot; uploaded {SPEC_META.uploadedAt} &middot; compared against {SPEC_META.windowLabel.toLowerCase()} of production traffic
          </p>
        </div>
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200">
            <AlertTriangle className="h-4 w-4" />
            {criticalCount} critical issue{criticalCount > 1 ? "s" : ""} need attention
          </div>
        )}
      </div>

      {/* Top summary row */}
      <div className="mt-6 grid grid-cols-12 gap-4">
        <div className="col-span-4 flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-5">
          <MatchScoreRing pct={matchScorePct()} />
          <div>
            <div className="text-sm font-medium text-slate-900">Spec match score</div>
            <div className="mt-1 text-sm text-slate-500">
              {SPEC_META.matchedEndpoints} of {SPEC_META.totalSpecEndpoints} spec endpoints align with observed traffic.
            </div>
            <div className="mt-1 text-sm text-slate-500">{SPEC_META.totalObservedEndpoints} endpoints observed in traffic.</div>
          </div>
        </div>

        <div className="col-span-8 grid grid-cols-5 gap-3">
          {ISSUE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? null : t)}
              className={`rounded-xl border p-4 text-left transition ${
                typeFilter === t ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className={`text-2xl font-bold ${typeFilter === t ? "text-white" : "text-slate-900"}`}>{counts.get(t)}</div>
              <div className={`mt-1 text-xs leading-snug ${typeFilter === t ? "text-slate-300" : "text-slate-500"}`}>{ISSUE_TYPE_LABELS[t]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Risk heatmap by area */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Risk by area</h2>
        <p className="mt-0.5 text-xs text-slate-500">Click an area to focus the priority queue below.</p>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {AREAS.map((area) => {
            const areaIssues = issues.filter((i) => i.area === area);
            const risk = areaRiskLabel(areaIssues);
            const isActive = areaFilter === area;
            return (
              <button
                key={area}
                onClick={() => setAreaFilter(areaFilter === area ? null : area)}
                className={`rounded-lg border p-4 text-left transition ${
                  isActive ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{area}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${risk.classes}`}>{risk.label}</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">{areaIssues.length} issue{areaIssues.length === 1 ? "" : "s"}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority queue */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Priority queue</h2>
            <p className="mt-0.5 text-xs text-slate-500">Ranked by combined risk: issue type, area sensitivity, traffic volume, recency.</p>
          </div>
          {(areaFilter || typeFilter) && (
            <button
              onClick={() => {
                setAreaFilter(null);
                setTypeFilter(null);
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              Clear filters
            </button>
          )}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
              <th className="px-5 py-2 font-medium">Endpoint</th>
              <th className="px-5 py-2 font-medium">Area</th>
              <th className="px-5 py-2 font-medium">Issue</th>
              <th className="px-5 py-2 font-medium">Severity</th>
              <th className="px-5 py-2 font-medium">Traffic (7d)</th>
              <th className="px-5 py-2 font-medium">Last seen</th>
              <th className="px-5 py-2 font-medium">Suggested action</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((issue) => (
              <tr
                key={issue.id}
                onClick={() => onSelectIssue(issue.id)}
                className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <MethodBadge method={issue.method} />
                    <span className="font-mono text-xs text-slate-700">{issue.path}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <AreaBadge area={issue.area} />
                </td>
                <td className="px-5 py-3 text-xs text-slate-600">{ISSUE_TYPE_LABELS[issue.issueType]}</td>
                <td className="px-5 py-3">
                  <SeverityBadge severity={issue.severity} />
                </td>
                <td className="px-5 py-3 text-xs tabular-nums text-slate-600">{issue.traffic7d.toLocaleString()}</td>
                <td className="px-5 py-3 text-xs text-slate-500">{formatRelativeTime(issue.lastSeenMinutesAgo)}</td>
                <td className="px-5 py-3">
                  <ActionBadge action={issue.recommendedAction} />
                </td>
                <td className="px-3 py-3 text-slate-300">
                  <ChevronRight className="h-4 w-4" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-slate-400">
                  No issues match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        {filtered.length} of {issues.length} issues shown &middot; sorted by risk &middot; {ACTION_LABELS.investigate} actions require analyst review
      </p>
    </div>
  );
}
