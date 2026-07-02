
export function MatchScoreRing({ pct, size = 176 }: { pct: number; size?: number }) {
  const box = size;
  const center = box / 2;
  const radius = box * 0.386;
  const strokeWidth = box * 0.08;
  const valueFont = box * 0.182;
  const labelFont = Math.max(box * 0.0625, 9);

  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  // Traffic-light severity color: full match is the only "green" state —
  // anything less means at least one endpoint has drifted from spec, and
  // the ring should read as progressively more urgent the further it falls.
  const color =
    pct >= 100 ? "#22c55e" // green-500 — fully matched
    : pct >= 80 ? "#f97316" // orange-500 — mostly matched
    : pct >= 60 ? "#eab308" // yellow-500 — marginal
    : "#ef4444"; // red-500 — poor match, needs attention

  return (
    <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} className="shrink-0">
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-slate-100 dark:text-slate-800"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="animate-[ring-fill_1s_ease-out]"
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text x={center} y={center - 4} textAnchor="middle" fontSize={valueFont} fontWeight="800" className="fill-slate-900 dark:fill-white font-sans tracking-tight">
        {pct}%
      </text>
      <text x={center} y={center + labelFont + 6} textAnchor="middle" fontSize={labelFont} fontWeight="700" className="fill-slate-400 dark:fill-slate-500 uppercase tracking-widest">
        matched
      </text>
    </svg>
  );
}
