import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, PackageOpen } from "lucide-react";
import type { DiffStatus, Issue, RecommendedAction } from "../lib/types";
import { formatRelativeTime, formatCompactNumber } from "../lib/scoring";
import { ActionBadge, IssueTypeBadge, MethodBadge } from "./Badges";
import { useAnchoredMenu } from "../lib/useAnchoredMenu";

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

const ACTIONS: { action: RecommendedAction; helper: string }[] = [
  { action: "investigate", helper: "Open a security ticket for hands-on review of suspicious or undocumented behavior." },
  { action: "update_spec", helper: "Traffic reflects intended, legitimate behavior, so update the spec to match it." },
  { action: "notify_dev", helper: "Ownership or intent is unclear, so ask the owning team to confirm before deciding." },
  { action: "no_action", helper: "Low-risk drift, deprecated endpoint, or already-known issue. Dismiss for now." },
];

export function Investigation({
  issue,
  resolvedAction,
  onResolve,
}: {
  issue: Issue;
  resolvedAction: RecommendedAction | null;
  onResolve: (action: RecommendedAction) => void;
}) {
  return (
    <div className="px-6 pt-6 pb-20">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <MethodBadge method={issue.method} />
            <h1 className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">{issue.path}</h1>
          </div>
          <DeterminationDropdown
            resolvedAction={resolvedAction}
            recommendedAction={issue.recommendedAction}
            onSelect={onResolve}
          />
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
            <div className="rounded-[8px] border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-xs font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-800/30">
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
            <div className="rounded-[8px] border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-xs font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-800/30">
              No traffic observed
            </div>
          )}
        </div>
      </div>

      {/* Evidence */}
      {(issue.sampleRequestBody || issue.sampleResponseBody) && (
        <div className="mt-6 rounded-[12px] border border-slate-200/60 bg-white/50 p-6 glass shadow-sm animate-slide-up [animation-delay:300ms] dark:border-slate-800/60 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Traffic Evidence</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
            <div className="flex flex-col">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Request Trace</div>
              {issue.sampleRequestBody ? (
                <pre className="flex-1 overflow-x-auto rounded-[8px] bg-slate-900 p-4 font-mono text-[11px] text-indigo-300 dark:bg-black/50 ring-1 ring-white/5 shadow-inner">
                  {JSON.stringify(issue.sampleRequestBody, null, 2)}
                </pre>
              ) : (
                <EvidenceEmptyState label="No request body captured" hint="This method sends no body (e.g. GET), or none was recorded." />
              )}
            </div>
            <div className="flex flex-col">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Response Trace</div>
              {issue.sampleResponseBody ? (
                <pre className="flex-1 overflow-x-auto rounded-[8px] bg-slate-900 p-4 font-mono text-[11px] text-emerald-300 dark:bg-black/50 ring-1 ring-white/5 shadow-inner">
                  {JSON.stringify(issue.sampleResponseBody, null, 2)}
                </pre>
              ) : (
                <EvidenceEmptyState label="No response body captured" hint="No sample response was recorded for this traffic." />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Single-select dropdown for choosing the resolution path. Replaces a
// four-button banner (one full-width button per action, each with its own
// helper paragraph) with a compact trigger that expands into a menu — the
// same badge used everywhere else to represent an action (colored dot +
// label) doubles as the option's identity here, with its description
// underneath so the picker stays informative without staying open.
function DeterminationDropdown({
  resolvedAction,
  recommendedAction,
  onSelect,
}: {
  resolvedAction: RecommendedAction | null;
  recommendedAction: RecommendedAction;
  onSelect: (action: RecommendedAction) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { anchorRef, rect } = useAnchoredMenu(isOpen);
  // Until the reviewer actively picks something, the system's recommended
  // action is what's in effect — same fallback the table uses for its
  // Action column — so this control and the table never disagree about
  // what an unresolved issue's current action is.
  const effectiveAction = resolvedAction ?? recommendedAction;

  return (
    <div className="relative">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3.5 py-2 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/50"
      >
        <ActionBadge action={effectiveAction} />
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-250 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && rect && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="fixed z-50 w-80 rounded-xl border border-slate-200 bg-white py-1 shadow-lg animate-scale-up dark:border-slate-800 dark:bg-slate-900"
            style={{ top: rect.bottom + 6, left: rect.right - 320 }}
          >
            {ACTIONS.map(({ action, helper }) => {
              const isSelected = effectiveAction === action;
              const isRecommended = action === recommendedAction;
              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => {
                    onSelect(action);
                    setIsOpen(false);
                  }}
                  className={`flex w-full cursor-pointer flex-col items-start gap-1 px-4 py-3 text-left transition-colors ${
                    isSelected ? "bg-indigo-50/50 dark:bg-indigo-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <ActionBadge action={action} />
                    <div className="flex shrink-0 items-center gap-2">
                      {isRecommended && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Recommended</span>
                      )}
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{helper}</p>
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
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

// Fills the Request/Response Trace slot when there's nothing captured for
// it, so a single-sided trace (e.g. a GET with no request body) doesn't
// leave one side of the grid looking broken or empty by comparison.
function EvidenceEmptyState({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-800/30">
      <PackageOpen className="h-6 w-6 text-slate-300 dark:text-slate-600" />
      <div className="text-xs font-bold text-slate-400 dark:text-slate-500">{label}</div>
      <div className="max-w-[220px] text-[11px] font-medium text-slate-400 dark:text-slate-500">{hint}</div>
    </div>
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
