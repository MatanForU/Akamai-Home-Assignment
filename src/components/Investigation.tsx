import { useState, type ReactNode } from "react";
import { CircleCheck, FileEdit, MessageSquareWarning, SearchCheck } from "lucide-react";
import type { DiffStatus, Issue, RecommendedAction } from "../lib/types";
import { ACTION_LABELS, formatRelativeTime, formatCompactNumber } from "../lib/scoring";
import { ActionBadge, IssueTypeBadge, MethodBadge } from "./Badges";
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
  { action: "update_spec", icon: FileEdit, helper: "Traffic reflects intended, legitimate behavior, so update the spec to match it." },
  { action: "notify_dev", icon: MessageSquareWarning, helper: "Ownership or intent is unclear, so ask the owning team to confirm before deciding." },
  { action: "no_action", icon: CircleCheck, helper: "Low-risk drift, deprecated endpoint, or already-known issue. Dismiss for now." },
];

export function Investigation({ issue }: { issue: Issue }) {
  const [resolvedAction, setResolvedAction] = useState<RecommendedAction | null>(null);

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <MethodBadge method={issue.method} />
          <h1 className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">{issue.path}</h1>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetaTile label="Area" value={issue.area} />
          <MetaTile label="Traffic" value={`${formatCompactNumber(issue.traffic7d)} req`} />
          <MetaTile label="Auth" value={issue.authMethod} />
          <MetaTile label="Last seen" value={formatRelativeTime(issue.lastSeenMinutesAgo)} />
        </div>
      </div>

      {/* Rationale */}
      <div className="mt-6 rounded-[12px] border border-slate-200/60 bg-white/50 p-6 glass shadow-sm animate-slide-up [animation-delay:100ms] dark:border-slate-800/60 dark:bg-slate-900/50">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Endpoint Issue Explanation</h2>
          <IssueTypeBadge issueType={issue.issueType} />
        </div>
        <p className="text-base font-medium leading-relaxed text-slate-700 dark:text-slate-300">
          <HighlightedText text={issue.rationale} terms={[issue.area, `${issue.traffic7d.toLocaleString()} requests`]} />
        </p>
      </div>

      {/* Spec vs observed */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 animate-slide-up [animation-delay:200ms]">
        <div className="rounded-[12px] border border-slate-200/60 bg-white/50 p-6 glass shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Expected Specification</h3>
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

        <div className="rounded-[12px] border border-slate-200/60 bg-white/50 p-6 glass shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Live Traffic Observation</h3>
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

      {/* Evidence */}
      {(issue.sampleRequestBody || issue.sampleResponseBody) && (
        <div className="mt-6 rounded-[12px] border border-slate-200/60 bg-white/50 p-6 glass shadow-sm animate-slide-up [animation-delay:300ms] dark:border-slate-800/60 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Traffic Evidence</h3>
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

// Highlights data-driven terms inside a body of text (e.g. the area name,
// the traffic count) so the reader can spot, at a glance, which words in the
// rationale are actual product data rather than descriptive prose.
function HighlightedText({ text, terms }: { text: string; terms: string[] }) {
  const escaped = terms.filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (escaped.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${escaped.join("|")})`, "g");
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        terms.includes(part) ? (
          <mark key={i} className="rounded bg-gray-200 px-1 py-0.5 font-semibold text-slate-900 dark:bg-slate-700 dark:text-white">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

function MetaTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[8px] border border-slate-200/60 bg-white/60 px-3.5 py-2.5 dark:border-slate-800/60 dark:bg-slate-900/40">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</div>
      <div className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-200">{value}</div>
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
      {status !== "match" && <span className="text-xs font-medium">{DIFF_LABEL[status]}</span>}
    </div>
  );
}
