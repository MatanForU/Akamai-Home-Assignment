import { useEffect, useState } from "react";

export function MatchScoreRing({ pct }: { pct: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const color = pct >= 90 ? "#16a34a" : pct >= 75 ? "#d97706" : "#dc2626";

  const [animatedPct, setAnimatedPct] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimatedPct(pct));
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  const offset = circumference * (1 - animatedPct / 100);

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
      <circle cx="70" cy="70" r={radius} fill="none" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="12" />
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
      />
      <text x="70" y="66" textAnchor="middle" fontSize="28" fontWeight="700" className="fill-slate-900 dark:fill-slate-100">
        {pct}%
      </text>
      <text x="70" y="86" textAnchor="middle" fontSize="11" className="fill-slate-500 dark:fill-slate-400">
        matched
      </text>
    </svg>
  );
}
