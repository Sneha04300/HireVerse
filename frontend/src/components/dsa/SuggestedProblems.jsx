const DIFFICULTY_STYLES = {
  Easy:   { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)" },
  Medium: { color: "#eab308", bg: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.3)" },
  Hard:   { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)" },
};

export default function SuggestedProblems({ problems }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Suggested Problems</p>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: "rgba(167,139,250,0.12)", border: "0.5px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}
        >
          AI-picked
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {problems.map((p) => {
          const diff = DIFFICULTY_STYLES[p.difficulty];
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
              style={{ border: "0.5px solid var(--border)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0"
                  style={{ background: "rgba(167,139,250,0.15)", border: "0.5px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}
                >
                  {p.topic}
                </span>
                <span className="text-[var(--text-primary)] text-sm font-medium truncate">{p.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[var(--text-muted)] text-xs hidden sm:inline">{p.platform}</span>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: diff.bg, border: `0.5px solid ${diff.border}`, color: diff.color }}
                >
                  {p.difficulty}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
