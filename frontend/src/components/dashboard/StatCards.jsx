const STATS = [
  {
    id: "resume",
    label: "Resume Score",
    value: "84",
    sub: "+4 vs last scan",
    subColor: "#22c55e",
    gradient: "linear-gradient(135deg,#1a1040 0%,#0f1a2e 100%)",
  },
  {
    id: "leetcode",
    label: "LeetCode Solved",
    value: "340",
    sub: "28-day streak 🔥",
    subColor: "#f97316",
    gradient: "linear-gradient(135deg,#0a1a2a 0%,#0a2218 100%)",
  },
  {
    id: "github",
    label: "GitHub Score",
    value: "78",
    sub: "15 repos · 480 commits",
    subColor: "#9ca3af",
    gradient: "linear-gradient(135deg,#0f1628 0%,#0a1a14 100%)",
  },
  {
    id: "interview",
    label: "Interview Score",
    value: "65",
    sub: "Mock #3 pending",
    subColor: "#9ca3af",
    gradient: "linear-gradient(135deg,#1a1025 0%,#0d1a2a 100%)",
  },
];

export default function StatCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((s) => (
        <div
          key={s.id}
          className="rounded-2xl p-5 flex flex-col gap-1"
          style={{ background: s.gradient, border: "0.5px solid #1e2535" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">{s.label}</p>
          <p className="text-white text-4xl font-extrabold leading-tight mt-1">{s.value}</p>
          <p className="text-xs mt-1" style={{ color: s.subColor }}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
