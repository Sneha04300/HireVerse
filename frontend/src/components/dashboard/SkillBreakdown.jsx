const SKILLS = [
  { label: "Resume", score: 84, color: "#22c55e" },
  { label: "DSA", score: 70, color: "#eab308" },
  { label: "Projects", score: 88, color: "#22c55e" },
  { label: "GitHub", score: 76, color: "var(--brand-secondary)" },
  { label: "Communication", score: 60, color: "#eab308" },
];

function SkillBar({ label, score, color }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[var(--text-secondary)] text-sm">{label}</span>
        <span className="text-[var(--text-primary)] text-sm font-bold">{score}</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: "var(--ring-track)" }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function SkillBreakdown() {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5 h-full"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Skill Breakdown</p>
        <button className="text-sm font-medium transition-colors" style={{ color: "var(--brand-secondary)" }}>
          View details →
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {SKILLS.map((s) => (
          <SkillBar key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}
