import { useState } from "react";
import type { Severity } from "../lib/types";

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

// Fixed, saturated hex values: this ring needs bold, vivid fills that read
// clearly on a white card, unlike the desaturated "--sev-*" tokens used for badges.
const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#0ea5e9",
};

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const BOX = 176;
const CENTER = BOX / 2;
const RADIUS = 68;
const STROKE_WIDTH = 14;
const VALUE_FONT = 32;
const LABEL_FONT = 11;

export function SeverityDonut({
  counts,
  active,
  onSelect,
}: {
  counts: Record<Severity, number>;
  active: Severity | null;
  onSelect: (severity: Severity | null) => void;
}) {
  const [hovered, setHovered] = useState<Severity | null>(null);

  const total = SEVERITIES.reduce((sum, s) => sum + counts[s], 0);
  const circumference = 2 * Math.PI * RADIUS;
  const segGap = total > 1 ? 4 : 0;

  let cumulative = 0;
  const segments = SEVERITIES.filter((s) => counts[s] > 0).map((s) => {
    const length = (counts[s] / total) * circumference;
    const segment = { severity: s, length: Math.max(length - segGap, 0), offset: cumulative };
    cumulative += length;
    return segment;
  });

  const shown = hovered ?? active;
  const centerValue = shown ? counts[shown] : total;
  const centerLabel = shown ? SEVERITY_LABEL[shown] : "Total issues";
  const highlighted = hovered ?? active;

  return (
    <div className="flex items-center gap-8">
      <svg width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`} className="shrink-0">
        <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="currentColor" strokeWidth={STROKE_WIDTH} className="text-slate-100 dark:text-slate-800" />
          {segments.map((seg) => (
            <circle
              key={seg.severity}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={SEVERITY_COLOR[seg.severity]}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={`${seg.length} ${circumference - seg.length}`}
              strokeDashoffset={-seg.offset}
              className="cursor-pointer transition-all duration-150"
              style={{
                opacity: highlighted && highlighted !== seg.severity ? 0.3 : 1,
                strokeWidth: hovered === seg.severity ? STROKE_WIDTH + 3 : STROKE_WIDTH,
              }}
              onMouseEnter={() => setHovered(seg.severity)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(active === seg.severity ? null : seg.severity)}
            >
              <title>{`${SEVERITY_LABEL[seg.severity]}: ${counts[seg.severity]} issue${counts[seg.severity] === 1 ? "" : "s"}`}</title>
            </circle>
          ))}
        </g>
        <text x={CENTER} y={CENTER - 4} textAnchor="middle" fontSize={VALUE_FONT} fontWeight="800" className="fill-slate-900 dark:fill-white font-sans tracking-tight">
          {centerValue}
        </text>
        <text x={CENTER} y={CENTER + LABEL_FONT + 6} textAnchor="middle" fontSize={LABEL_FONT} fontWeight="700" className="fill-slate-400 dark:fill-slate-500 uppercase tracking-widest">
          {centerLabel}
        </text>
      </svg>

      <div className="flex flex-col gap-1.5">
        {SEVERITIES.filter((s) => counts[s] > 0).map((s) => {
          const isActive = active === s;
          const isHighlighted = highlighted === s;
          return (
            <button
              key={s}
              onClick={() => onSelect(isActive ? null : s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center justify-between gap-6 rounded-lg px-2.5 py-1.5 text-left transition-all duration-150 ${
                isHighlighted ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
              style={{ opacity: highlighted && !isHighlighted ? 0.5 : 1 }}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: SEVERITY_COLOR[s] }} />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{SEVERITY_LABEL[s]}</span>
              </span>
              <span className="text-right text-sm font-bold tabular-nums text-slate-900 dark:text-white">{counts[s]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
