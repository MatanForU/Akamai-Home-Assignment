
const BOX = 176;
const CENTER = BOX / 2;
const RADIUS = 68;
const STROKE_WIDTH = 14;
const VALUE_FONT = 32;
const LABEL_FONT = 11;

export function MatchScoreRing({ pct }: { pct: number }) {
  const circumference = 2 * Math.PI * RADIUS;
  const offset = circumference * (1 - pct / 100);
  const color = "#6366f1";

  return (
    <svg width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`} className="shrink-0">
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        className="text-slate-100 dark:text-slate-800"
        strokeWidth={STROKE_WIDTH}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="animate-[ring-fill_1s_ease-out]"
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
      />
      <text x={CENTER} y={CENTER - 4} textAnchor="middle" fontSize={VALUE_FONT} fontWeight="800" className="fill-slate-900 dark:fill-white font-sans tracking-tight">
        {pct}%
      </text>
      <text x={CENTER} y={CENTER + LABEL_FONT + 6} textAnchor="middle" fontSize={LABEL_FONT} fontWeight="700" className="fill-slate-400 dark:fill-slate-500 uppercase tracking-widest">
        matched
      </text>
    </svg>
  );
}
