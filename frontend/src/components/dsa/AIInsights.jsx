const IconSparkle = () => (
  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5L5 3zM19 9l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
  </svg>
);

export default function AIInsights({ insights }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(6,182,212,0.12)", border: "0.5px solid rgba(6,182,212,0.3)" }}
        >
          <IconSparkle />
        </div>
        <h3 className="text-[var(--text-primary)] font-bold text-base">AI Insights</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3" style={{ background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.25)" }}>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Weakest</p>
          <p className="text-red-400 font-bold text-sm">{insights.weakest}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: "rgba(34,197,94,0.08)", border: "0.5px solid rgba(34,197,94,0.25)" }}>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Strongest</p>
          <p className="text-green-400 font-bold text-sm">{insights.strongest}</p>
        </div>
      </div>

      <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
        Your weakest topic is <span className="text-[var(--text-primary)] font-semibold">{insights.weakest}</span>.{" "}
        {insights.recommendation}
      </p>

      <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)] mt-1">
        <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2c-1 3-4 5-4 9a4 4 0 008 0c0-1-.5-2-1-3 1 .5 2.5 2 2.5 4.5A5.5 5.5 0 0112 18a5.5 5.5 0 01-5.5-5.5C6.5 8 9 5 12 2z" />
        </svg>
        <p className="text-[var(--text-muted)] text-xs">{insights.streakNote}</p>
      </div>
    </div>
  );
}
