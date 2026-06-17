function scoreColor(score) {
  if (score >= 90) return "#22c55e";
  if (score >= 70) return "#06B6D4";
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
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e2535" strokeWidth={stroke} />
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
        <span className="text-white text-4xl font-extrabold leading-none">{score}%</span>
        <span className="text-gray-500 text-[10px] tracking-widest uppercase mt-1">{label}</span>
      </div>
    </div>
  );
}

function BreakdownCard({ label, score, status }) {
  const color = scoreColor(score);
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: "#111827", border: "0.5px solid #1e2535" }}>
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
          background: `${color}20`, border: `0.5px solid ${color}60`, color
        }}>{status}</span>
      </div>
      <span className="text-white text-3xl font-extrabold leading-none">{score}</span>
      <div className="h-1.5 rounded-full" style={{ background: "#1e2535" }}>
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export default function ATSScoreCard({ atsScore, batchRank, breakdown }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Score ring */}
      <div
        className="rounded-2xl p-8 flex flex-col items-center gap-4"
        style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}
      >
        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Resume Score</p>
        <ScoreRing score={atsScore} />
        <p className="text-gray-400 text-sm">{batchRank} of your batch</p>
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {breakdown.map((b) => (
          <BreakdownCard key={b.label} {...b} />
        ))}
      </div>
    </div>
  );
}
