
export function MatchScoreRing({ pct }: { pct: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const color = pct >= 90 ? "#6366f1" : pct >= 75 ? "#f59e0b" : "#ef4444";

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0 drop-shadow-sm">
      <circle 
        cx="70" 
        cy="70" 
        r={radius} 
        fill="none" 
        stroke="currentColor" 
        className="text-slate-100 dark:text-slate-800" 
        strokeWidth="10" 
      />
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="animate-[ring-fill_1s_ease-out]"
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="66" textAnchor="middle" fontSize="28" fontWeight="800" className="fill-slate-900 dark:fill-white font-sans tracking-tight">
        {pct}%
      </text>
      <text x="70" y="88" textAnchor="middle" fontSize="11" fontWeight="600" className="fill-slate-400 dark:fill-slate-500 uppercase tracking-widest">
        matched
      </text>
    </svg>
  );
}
