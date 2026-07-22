function scoreColor(score) {
  if (score >= 90) return "#22c55e";
  if (score >= 70) return "var(--brand-accent)";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

function ScoreRing({ score, size = 180, stroke = 16, label = "ATS Score" }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="atsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--ring-gradient-from)" />
            <stop offset="100%" stopColor="var(--ring-gradient-to)" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={score >= 70 ? "url(#atsGrad)" : color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[var(--text-primary)] text-4xl font-extrabold leading-none">{score}%</span>
        <span className="text-[var(--text-muted)] text-[10px] tracking-widest uppercase mt-1">{label}</span>
      </div>
    </div>
  );
}

function BreakdownCard({ label, score, status }) {
  const color = scoreColor(score);
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2 h-full" style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)" }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-widest truncate">{label}</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0" style={{
          background: `${color}20`, border: `0.5px solid ${color}60`, color
        }}>{status}</span>
      </div>
      <span className="text-[var(--text-primary)] text-3xl font-extrabold leading-none">{score}<span className="text-[var(--text-tertiary)] text-sm font-medium ml-0.5">/100</span></span>
      <div className="h-1.5 rounded-full mt-auto" style={{ background: "var(--border)" }}>
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export default function ATSScoreCard({ atsScore, batchRank, breakdown = [] }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Score ring */}
      <div
        className="rounded-2xl p-8 flex flex-col items-center gap-4"
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
      >
        <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)]">Resume Score</p>
        <ScoreRing score={atsScore} />
        <p className="text-[var(--text-tertiary)] text-sm">{batchRank} of your batch</p>
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-stretch">
        {breakdown.map((b) => (
          <BreakdownCard key={b.label} {...b} />
        ))}
      </div>
    </div>
  );
}
