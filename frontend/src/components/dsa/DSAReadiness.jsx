function ReadinessRing({ score, size = 180 }) {
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="dsaRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--ring-gradient-from)" />
            <stop offset="100%" stopColor="var(--ring-gradient-to)" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="url(#dsaRingGrad)" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[var(--text-primary)] text-4xl font-extrabold leading-none">{score}%</span>
        <span className="text-[var(--text-muted)] text-[10px] tracking-widest uppercase mt-1">DSA Readiness</span>
      </div>
    </div>
  );
}

export default function DSAReadiness({ data }) {
  return (
    <div
      className="rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8"
      style={{ background: "var(--bg-gradient-hero)", border: "0.5px solid var(--border)" }}
    >
      <ReadinessRing score={data.score} />

      <div className="flex flex-col gap-4 flex-1">
        <div>
          <h3 className="text-[var(--text-primary)] text-xl font-extrabold leading-tight">DSA Readiness Score</h3>
          <p className="text-[var(--text-tertiary)] text-sm mt-1.5">
            You're solving consistently. Close the gap in Dynamic Programming and Backtracking to break 85%.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Strengths</p>
            <div className="flex flex-wrap gap-1.5">
              {data.strengths.map((s) => (
                <span
                  key={s}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(34,197,94,0.12)", border: "0.5px solid rgba(34,197,94,0.3)", color: "#22c55e" }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Gaps</p>
            <div className="flex flex-wrap gap-1.5">
              {data.gaps.map((g) => (
                <span
                  key={g}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(239,68,68,0.12)", border: "0.5px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
