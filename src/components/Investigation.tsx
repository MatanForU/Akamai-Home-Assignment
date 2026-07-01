import { useState } from "react";
import { ArrowLeft, CircleCheck, FileEdit, MessageSquareWarning, SearchCheck } from "lucide-react";
import type { DiffStatus, Issue, RecommendedAction } from "../lib/types";
import { computeRisk } from "../lib/scoring";
import { ACTION_LABELS, formatRelativeTime } from "../lib/scoring";
import { ActionBadge, AreaBadge, MethodBadge } from "./Badges";
import { AlertCard } from "../design-system/components/AlertCard";
import { Button } from "../design-system/components/Button";

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
    <div className="px-6 py-6">
      <Button variant="ghost" size="sm" iconLeft={<ArrowLeft size={14} />} onClick={onBack} style={{ marginBottom: 24 }}>
        Close
      </Button>

      {/* Header */}
      <AlertCard
        severity={issue.severity}
        title={
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MethodBadge method={issue.method} />
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800 }}>{issue.path}</span>
          </span>
        }
        meta={`Traffic: ${issue.traffic7d.toLocaleString()} reqs (7d)  ·  Auth: ${issue.authMethod}  ·  Error rate: ${issue.errorRate}%`}
        timestamp={formatRelativeTime(issue.lastSeenMinutesAgo)}
        actions={<AreaBadge area={issue.area} />}
      />

      {/* Risk rationale */}
      <div className="mt-6 rounded-2xl border border-slate-200/60 bg-white/50 p-6 glass shadow-sm animate-slide-up [animation-delay:100ms] dark:border-slate-800/60 dark:bg-slate-900/50">
        <h2 className="text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">Analysis Rationale</h2>
        <p className="text-base font-medium leading-relaxed text-slate-700 dark:text-slate-300">{issue.rationale}</p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
          {[
            { label: "Issue type", value: risk.issueTypeScore, max: 40 },
            { label: "Area sensitivity", value: risk.areaScore, max: 30 },
            { label: "Traffic volume", value: risk.trafficScore, max: 20 },
            { label: "Recency", value: risk.recencyScore, max: 10 },
          ].map((f) => (
            <div key={f.label}>
              <div className="flex items-baseline justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                <span>{f.label}</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {f.value}/{f.max}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-indigo-600 transition-all duration-1000 ease-out" 
                  style={{ width: `${(f.value / f.max) * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spec vs observed */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 animate-slide-up [animation-delay:200ms]">
        <div className="rounded-2xl border border-slate-200/60 bg-white/50 p-6 glass shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Expected Specification</h3>
          </div>
          {issue.specSnippet ? (
            <div className="space-y-2 font-mono text-xs">
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
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-xs font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-800/30">
              Not found in specification
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white/50 p-6 glass shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Live Traffic Observation</h3>
          </div>
          {issue.observedSnippet ? (
            <div className="space-y-2 font-mono text-xs">
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
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-xs font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-800/30">
              No traffic observed
            </div>
          )}
        </div>
      </div>

      {issue.fieldDiffs.some((d) => d.status === "mismatch" && d.note) && (
        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs font-bold text-amber-700 dark:text-amber-400 animate-slide-up [animation-delay:250ms]">
          {issue.fieldDiffs
            .filter((d) => d.status === "mismatch" && d.note)
            .map((d) => (
              <p key={d.field} className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span><span className="uppercase text-[9px] tracking-widest opacity-60 mr-1">{d.field}:</span> {d.note}</span>
              </p>
            ))}
        </div>
      )}

      {/* Evidence */}
      {(issue.sampleRequestBody || issue.sampleResponseBody) && (
        <div className="mt-6 rounded-2xl border border-slate-200/60 bg-white/50 p-6 glass shadow-sm animate-slide-up [animation-delay:300ms] dark:border-slate-800/60 dark:bg-slate-900/50">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Traffic Evidence</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {issue.sampleRequestBody && (
              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Request Trace</div>
                <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-[11px] text-indigo-300 dark:bg-black/50 ring-1 ring-white/5 shadow-inner">
                  {JSON.stringify(issue.sampleRequestBody, null, 2)}
                </pre>
              </div>
            )}
            {issue.sampleResponseBody && (
              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Response Trace</div>
                <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-[11px] text-emerald-300 dark:bg-black/50 ring-1 ring-white/5 shadow-inner">
                  {JSON.stringify(issue.sampleResponseBody, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 rounded-2xl border border-slate-200/60 bg-indigo-600/5 p-6 glass shadow-xl animate-slide-up [animation-delay:400ms] dark:border-indigo-500/10 mb-20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Determination</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Select the resolution path for this issue</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recommended:</span>
            <ActionBadge action={issue.recommendedAction} />
          </div>
        </div>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {ACTIONS.map(({ action, icon: Icon, helper }) => {
            const isSuggested = action === issue.recommendedAction;
            const isChosen = resolvedAction === action;
            return (
              <div key={action} style={{ flex: "1 1 180px", display: "flex", flexDirection: "column", gap: 6 }}>
                <Button
                  variant={isChosen ? "primary" : isSuggested ? "secondary" : "ghost"}
                  size="lg"
                  iconLeft={<Icon size={16} />}
                  onClick={() => setResolvedAction(action)}
                  style={{ width: "100%", justifyContent: "flex-start", borderRadius: "var(--radius-md)" }}
                >
                  {ACTION_LABELS[action]}
                </Button>
                <p style={{ font: "var(--text-caption)", color: "var(--fg-tertiary)", paddingLeft: 4, margin: 0 }}>{helper}</p>
              </div>
            );
          })}
        </div>
        
        {resolvedAction && (
          <div className="mt-6 flex animate-scale-up items-center gap-3 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20">
            <CircleCheck className="h-5 w-5" />
            Resolution recorded: {ACTION_LABELS[resolvedAction]}
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
