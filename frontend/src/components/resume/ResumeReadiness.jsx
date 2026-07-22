function ReadinessMeter({ score }) {
  const size = 200;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="rmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--ring-gradient-from)" />
            <stop offset="100%" stopColor="var(--ring-gradient-to)" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="url(#rmGrad)" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[var(--text-primary)] text-5xl font-extrabold leading-none">{score}%</span>
        <span className="text-[var(--text-muted)] text-[10px] tracking-widest uppercase mt-2 font-medium">Readiness</span>
      </div>
    </div>
  );
}

export default function ResumeReadiness({ atsScore, placementImpact, batchRank }) {
  return (
    <div
      className="rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <ReadinessMeter score={atsScore} />

      <div className="flex flex-col gap-5 flex-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Resume Readiness</p>
          <h3 className="text-[var(--text-primary)] text-2xl font-extrabold leading-tight">Overall Resume Readiness</h3>
          <p className="text-[var(--text-tertiary)] text-sm mt-2 leading-relaxed">
            Your resume is performing well. Focus on adding measurable metrics and the missing keywords to break into the top 10%.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl p-4 flex flex-col justify-center" style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)" }}>
            <p className="text-[var(--text-muted)] text-xs uppercase tracking-widest mb-1">Placement Impact</p>
            <p className="text-[var(--text-primary)] text-2xl font-extrabold">
              <span className="text-green-400">{placementImpact}</span>
            </p>
          </div>
          <div className="rounded-xl p-4 flex flex-col justify-center" style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)" }}>
            <p className="text-[var(--text-muted)] text-xs uppercase tracking-widest mb-1">Batch Rank</p>
            <p className="text-[var(--text-primary)] text-2xl font-extrabold">{batchRank}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
