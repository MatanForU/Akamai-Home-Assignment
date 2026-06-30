export function MatchScoreRing({ pct }: { pct: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const color = pct >= 90 ? "#16a34a" : pct >= 75 ? "#d97706" : "#dc2626";

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
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
      />
      <text x="70" y="66" textAnchor="middle" fontSize="28" fontWeight="700" fill="#0f172a">
        {pct}%
      </text>
      <text x="70" y="86" textAnchor="middle" fontSize="11" fill="#64748b">
        matched
      </text>
    </svg>
  );
}
