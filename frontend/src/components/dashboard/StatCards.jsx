const STATS = [
  {
    id: "resume",
    label: "Resume Score",
    value: "84",
    sub: "+4 vs last scan",
    subColor: "#22c55e",
    gradient: "var(--bg-gradient-card)",
  },
  {
    id: "leetcode",
    label: "LeetCode Solved",
    value: "340",
    sub: "28-day streak ",
    subColor: "#f97316",
    gradient: "var(--bg-gradient-card)",
  },
  {
    id: "github",
    label: "GitHub Score",
    value: "78",
    sub: "15 repos · 480 commits",
    subColor: "var(--text-muted)",
    gradient: "var(--bg-gradient-card)",
  },
  {
    id: "interview",
    label: "Interview Score",
    value: "65",
    sub: "Mock #3 pending",
    subColor: "var(--text-muted)",
    gradient: "var(--bg-gradient-card)",
  },
];

export default function StatCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((s) => (
        <div
          key={s.id}
          className="rounded-2xl p-5 flex flex-col gap-1"
          style={{ background: "var(--bg-gradient-card)", border: "0.5px solid var(--border)" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{s.label}</p>
          <p className="text-[var(--text-primary)] text-4xl font-extrabold leading-tight mt-1">{s.value}</p>
          <p className="text-xs mt-1" style={{ color: s.subColor }}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
