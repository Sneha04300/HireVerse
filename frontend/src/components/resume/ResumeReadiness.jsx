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
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e2535" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="url(#rmGrad)" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white text-5xl font-extrabold leading-none">{score}%</span>
        <span className="text-gray-500 text-[10px] tracking-widest uppercase mt-2 font-medium">Readiness</span>
      </div>
    </div>
  );
}

export default function ResumeReadiness({ atsScore, placementImpact, batchRank }) {
  return (
    <div
      className="rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8"
      style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}
    >
      <ReadinessMeter score={atsScore} />

      <div className="flex flex-col gap-5 flex-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Resume Readiness</p>
          <h3 className="text-white text-2xl font-extrabold leading-tight">Overall Resume Readiness</h3>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            Your resume is performing well. Focus on adding measurable metrics and the missing keywords to break into the top 10%.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl p-4" style={{ background: "#111827", border: "0.5px solid #1e2535" }}>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Placement Impact</p>
            <p className="text-white text-2xl font-extrabold">
              <span className="text-green-400">+{placementImpact}</span>
              <span className="text-base font-medium text-gray-400 ml-1">pts</span>
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "#111827", border: "0.5px solid #1e2535" }}>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Batch Rank</p>
            <p className="text-white text-2xl font-extrabold">{batchRank}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
