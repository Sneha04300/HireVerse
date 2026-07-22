function MiniSparkline({ values }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 160, h = 48;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--ring-gradient-from)" />
          <stop offset="100%" stopColor="var(--ring-gradient-to)" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="url(#sparkGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
        return <circle key={i} cx={x} cy={y} r="3" fill={i === values.length - 1 ? "#06B6D4" : "var(--border)"} stroke="#06B6D4" strokeWidth="1.5" />;
      })}
    </svg>
  );
}

function BenchmarkBar({ score, benchmark }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--text-tertiary)]">You <span className="text-[var(--text-primary)] font-bold">{score}</span></span>
        <span className="text-[var(--text-tertiary)]">Industry avg <span className="text-[var(--text-primary)] font-bold">{benchmark}</span></span>
      </div>
      <div className="relative h-2.5 rounded-full bg-[var(--border)]">
        <div className="absolute h-2.5 rounded-full" style={{ width: `${benchmark}%`, background: "var(--border)", border: "1px solid var(--text-muted)" }} />
        <div className="absolute h-2.5 rounded-full transition-all duration-700" style={{ width: `${score}%`, background: "linear-gradient(90deg,#7C3AED,#06B6D4)" }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-yellow-400" style={{ left: `${benchmark}%` }} />
      </div>
      <p className="text-[10px] text-[var(--text-tertiary)]">Yellow line = industry average</p>
    </div>
  );
}

export default function ResumeInsightsPanel({ data = {} }) {
  const { atsTrend, industryBenchmark, atsScore, topMissingSkills, resumeRank, totalResumes } = data;

  return (
    <div className="flex flex-col gap-4">

      {/* ATS Trend */}
      <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">ATS Trend</p>
        <MiniSparkline values={atsTrend} />
        <div className="flex justify-between mt-2">
          {atsTrend.map((v, i) => (
            <span key={i} className="text-[10px] text-[var(--text-tertiary)]">{v}</span>
          ))}
        </div>
        <p className="text-[var(--text-tertiary)] text-xs mt-2">
          Score improved by <span className="text-green-400 font-bold">+{atsTrend[atsTrend.length - 1] - atsTrend[0]}</span> pts over 5 scans
        </p>
      </div>

      {/* Industry Benchmark */}
      <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Industry Benchmark</p>
        <BenchmarkBar score={atsScore} benchmark={industryBenchmark} />
        <p className="text-xs text-cyan-400 mt-2 font-medium">
          You're {atsScore - industryBenchmark} pts above average ✓
        </p>
      </div>

      {/* Resume Rank */}
      <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Resume Rank</p>
        <div className="flex items-end gap-2">
          <span className="text-[var(--text-primary)] text-3xl font-extrabold leading-none">#{resumeRank}</span>
          <span className="text-[var(--text-muted)] text-sm mb-0.5">of {totalResumes.toLocaleString()} resumes</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-[var(--border)]">
          <div
            className="h-1.5 rounded-full"
            style={{ width: `${((totalResumes - resumeRank) / totalResumes) * 100}%`, background: "linear-gradient(90deg,#7C3AED,#06B6D4)" }}
          />
        </div>
        <p className="text-[var(--text-muted)] text-xs mt-2">
          Better than {Math.round(((totalResumes - resumeRank) / totalResumes) * 100)}% of applicants
        </p>
      </div>

      {/* Top Missing Skills */}
      <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Top Missing Skills</p>
        <div className="flex flex-col gap-2">
          {topMissingSkills.map((skill, i) => (
            <div key={skill} className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)] text-sm">{skill}</span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(239,68,68,0.12)", border: "0.5px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}
              >
                Missing
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
