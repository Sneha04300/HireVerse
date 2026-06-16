import ReadinessRing from "./ReadinessRing";

const SCORE_PILLS = [
  { label: "Resume", score: 84, color: "#22c55e", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.35)" },
  { label: "Projects", score: 88, color: "#22c55e", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.35)" },
  { label: "DSA", score: 70, color: "#eab308", bg: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.35)" },
  { label: "Comms", score: 60, color: "#ef4444", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.35)" },
];

export default function HeroCard() {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start"
      style={{
        background: "linear-gradient(135deg, #0f1628 0%, #0a1a2a 100%)",
        border: "0.5px solid #1e2a40",
      }}
    >
      {/* Ring */}
      <ReadinessRing percent={72} />

      {/* Insight */}
      <div className="flex flex-col justify-center gap-3 flex-1">
        {/* Badge */}
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full w-fit"
          style={{ background: "rgba(6,182,212,0.15)", border: "0.5px solid rgba(6,182,212,0.4)", color: "#06B6D4" }}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          6 pts this week
        </span>

        <div>
          <h2 className="text-white text-xl font-bold leading-tight">
            You're on track for Amazon SDE
          </h2>
          <p className="text-gray-400 text-sm mt-1.5 leading-relaxed max-w-md">
            Close your biggest gap — <span className="text-red-400 font-medium">Communication</span> — with 2 mock interviews this week.
          </p>
        </div>

        {/* Score pills */}
        <div className="flex flex-wrap gap-2 mt-1">
          {SCORE_PILLS.map((p) => (
            <span
              key={p.label}
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: p.bg, border: `0.5px solid ${p.border}`, color: p.color }}
            >
              {p.label} {p.score}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
