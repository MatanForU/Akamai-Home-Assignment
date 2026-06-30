import { useState } from "react";
import { ArrowLeft, CircleCheck, FileEdit, MessageSquareWarning, SearchCheck } from "lucide-react";
import type { DiffStatus, Issue, RecommendedAction } from "../lib/types";
import { computeRisk } from "../lib/scoring";
import { ACTION_LABELS, formatRelativeTime, ISSUE_TYPE_LABELS } from "../lib/scoring";
import { ActionBadge, AreaBadge, MethodBadge, SeverityBadge } from "./Badges";

const DIFF_STYLES: Record<DiffStatus, string> = {
  extra: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300",
  missing: "bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300",
  mismatch: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300",
  match: "bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400",
};

const DIFF_LABEL: Record<DiffStatus, string> = {
  extra: "observed only",
  missing: "spec only",
  mismatch: "type mismatch",
  match: "match",
};

const ACTIONS: { action: RecommendedAction; icon: typeof SearchCheck; helper: string }[] = [
  { action: "investigate", icon: SearchCheck, helper: "Open a security ticket for hands-on review of suspicious or undocumented behavior." },
  { action: "update_spec", icon: FileEdit, helper: "Traffic reflects intended, legitimate behavior — update the spec to match it." },
  { action: "notify_dev", icon: MessageSquareWarning, helper: "Ownership or intent is unclear — ask the owning team to confirm before deciding." },
  { action: "no_action", icon: CircleCheck, helper: "Low-risk drift, deprecated endpoint, or already-known issue. Dismiss for now." },
];

export function Investigation({ issue, onBack }: { issue: Issue; onBack: () => void }) {
  const [resolvedAction, setResolvedAction] = useState<RecommendedAction | null>(null);
  const risk = computeRisk(issue.issueType, issue.area, issue.traffic7d, issue.lastSeenMinutesAgo);

  return (
    <div className="mx-auto max-w-5xl animate-fade-in px-4 py-6 sm:px-6 sm:py-8">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 rounded-md text-sm font-medium text-slate-500 transition hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:text-slate-400 dark:hover:text-slate-100 dark:focus-visible:outline-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to priority queue
        <kbd className="ml-1 hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:inline dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
          Esc
        </kbd>
      </button>

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <MethodBadge method={issue.method} />
          <span className="break-all font-mono text-base font-semibold text-slate-900 dark:text-slate-100">{issue.path}</span>
          <SeverityBadge severity={issue.severity} />
          <AreaBadge area={issue.area} />
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {ISSUE_TYPE_LABELS[issue.issueType]}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-y-3 border-t border-slate-100 pt-4 sm:grid-cols-4 sm:divide-x sm:divide-slate-100 dark:border-slate-800 dark:sm:divide-slate-800">
          <div className="px-4 first:pl-0">
            <div className="text-xs text-slate-400 dark:text-slate-500">Traffic (7d)</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">{issue.traffic7d.toLocaleString()} requests</div>
          </div>
          <div className="px-4">
            <div className="text-xs text-slate-400 dark:text-slate-500">Last seen</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatRelativeTime(issue.lastSeenMinutesAgo)}</div>
          </div>
          <div className="px-4">
            <div className="text-xs text-slate-400 dark:text-slate-500">Auth method</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">{issue.authMethod}</div>
          </div>
          <div className="px-4">
            <div className="text-xs text-slate-400 dark:text-slate-500">Error rate</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">{issue.errorRate}%</div>
          </div>
        </div>
      </div>

      {/* Risk rationale */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Why this matters</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{issue.rationale}</p>

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4">
          {[
            { label: "Issue type", value: risk.issueTypeScore, max: 40 },
            { label: "Area sensitivity", value: risk.areaScore, max: 30 },
            { label: "Traffic volume", value: risk.trafficScore, max: 20 },
            { label: "Recency", value: risk.recencyScore, max: 10 },
          ].map((f) => (
            <div key={f.label}>
              <div className="flex items-baseline justify-between text-xs text-slate-400 dark:text-slate-500">
                <span>{f.label}</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  {f.value}/{f.max}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-1.5 rounded-full bg-slate-900 transition-[width] duration-500 ease-out dark:bg-indigo-500"
                  style={{ width: `${(f.value / f.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
          Risk score is additive and shown in full so the ranking can be audited, not just trusted.
        </p>
      </div>

      {/* Spec vs observed */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Spec expects</h3>
          {issue.specSnippet ? (
            <div className="mt-3 space-y-1.5 font-mono text-xs">
              {Object.entries(issue.specSnippet).map(([k, v]) =>
                typeof v === "object" && v !== null ? (
                  Object.entries(v as Record<string, unknown>).map(([fk, fv]) => (
                    <FieldRow key={fk} field={fk} type={String(fv)} diffs={issue.fieldDiffs} side="spec" />
                  ))
                ) : (
                  <FieldRow key={k} field={k} type={String(v)} diffs={issue.fieldDiffs} side="spec" />
                ),
              )}
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500">
              This endpoint does not appear in the specification at all.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Observed in traffic</h3>
          {issue.observedSnippet ? (
            <div className="mt-3 space-y-1.5 font-mono text-xs">
              {Object.entries(issue.observedSnippet).map(([k, v]) =>
                typeof v === "object" && v !== null ? (
                  Object.entries(v as Record<string, unknown>).map(([fk, fv]) => (
                    <FieldRow key={fk} field={fk} type={String(fv)} diffs={issue.fieldDiffs} side="observed" />
                  ))
                ) : (
                  <FieldRow key={k} field={k} type={String(v)} diffs={issue.fieldDiffs} side="observed" />
                ),
              )}
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500">
              No requests matching this endpoint were seen in the last 7 days.
            </div>
          )}
        </div>
      </div>

      {issue.fieldDiffs.some((d) => d.status === "mismatch" && d.note) && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {issue.fieldDiffs
            .filter((d) => d.status === "mismatch" && d.note)
            .map((d) => (
              <p key={d.field}>
                <span className="font-semibold">{d.field}:</span> {d.note}
              </p>
            ))}
        </div>
      )}

      {/* Evidence */}
      {(issue.sampleRequestBody || issue.sampleResponseBody) && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Evidence: sample traffic</h3>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            {issue.sampleRequestBody && (
              <div>
                <div className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Request body</div>
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100 dark:bg-black/40">
                  {JSON.stringify(issue.sampleRequestBody, null, 2)}
                </pre>
              </div>
            )}
            {issue.sampleResponseBody && (
              <div>
                <div className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Response body</div>
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100 dark:bg-black/40">
                  {JSON.stringify(issue.sampleResponseBody, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">What should happen next?</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Suggested: <ActionBadge action={issue.recommendedAction} />
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIONS.map(({ action, icon: Icon, helper }) => {
            const isSuggested = action === issue.recommendedAction;
            const isChosen = resolvedAction === action;
            return (
              <button
                key={action}
                onClick={() => setResolvedAction(action)}
                aria-pressed={isChosen}
                className={`rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-indigo-400 ${
                  isChosen
                    ? "border-slate-900 bg-slate-900 text-white dark:border-indigo-500 dark:bg-indigo-600"
                    : isSuggested
                      ? "border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                }`}
              >
                <Icon className={`h-4 w-4 ${isChosen ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                <div className={`mt-2 text-sm font-semibold ${isChosen ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>{ACTION_LABELS[action]}</div>
                <div className={`mt-1 text-[11px] leading-snug ${isChosen ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>{helper}</div>
              </button>
            );
          })}
        </div>
        {resolvedAction && (
          <div className="mt-4 flex animate-fade-in items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
            <CircleCheck className="h-4 w-4" />
            Marked as "{ACTION_LABELS[resolvedAction]}". This issue moves out of the active priority queue.
          </div>
        )}
      </div>
    </div>
  );
}

function FieldRow({
  field,
  type,
  diffs,
  side,
}: {
  field: string;
  type: string;
  diffs: Issue["fieldDiffs"];
  side: "spec" | "observed";
}) {
  const diff = diffs.find((d) => d.field === field);
  const status: DiffStatus = diff?.status ?? "match";
  // a field "missing" from spec view means it's a spec-only field absent in observed, and vice versa
  if (side === "spec" && status === "extra") return null;
  if (side === "observed" && status === "missing") return null;

  return (
    <div className={`flex items-center justify-between rounded border px-2 py-1.5 ${DIFF_STYLES[status]}`}>
      <span>
        {field}: <span className="opacity-70">{type}</span>
      </span>
      {status !== "match" && <span className="text-[10px] font-semibold uppercase tracking-wide">{DIFF_LABEL[status]}</span>}
    </div>
  );
}
