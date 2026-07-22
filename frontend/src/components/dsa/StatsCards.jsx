const STAT_CONFIG = [
  {
    id: "solved",
    label: "Problems Solved",
    valueKey: "problemsSolved",
    sub: (d) => `+${d.weeklyGain} this week`,
    subColor: "#22c55e",
    gradient: "var(--bg-gradient-card)",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "streak",
    label: "Current Streak",
    valueKey: "currentStreak",
    suffix: "d",
    sub: () => "Personal best 🔥",
    subColor: "#f97316",
    gradient: "var(--bg-gradient-card)",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>
    ),
  },
  {
    id: "avg",
    label: "Daily Average",
    valueKey: "dailyAvg",
    sub: (d) => `Target: ${d.dailyTarget}`,
    subColor: "var(--text-secondary)",
    gradient: "var(--bg-gradient-card)",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14" />
      </svg>
    ),
  },
  {
    id: "rating",
    label: "Contest Rating",
    valueKey: "contestRating",
    sub: (d) => `Peak: ${d.maxRating}`,
    subColor: "#a78bfa",
    gradient: "var(--bg-gradient-card)",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77l-6.18 3.23L7 14.14 2 9.27l6.91-1.01z" />
      </svg>
    ),
  },
];

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STAT_CONFIG.map((cfg) => (
        <div
          key={cfg.id}
          className="rounded-2xl p-5 flex flex-col gap-1"
          style={{ background: cfg.gradient, border: "0.5px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">{cfg.label}</p>
            <span className="text-cyan-400">{cfg.icon}</span>
          </div>
          <p className="text-[var(--text-primary)] text-4xl font-extrabold leading-tight">
            {stats[cfg.valueKey]}{cfg.suffix || ""}
          </p>
          <p className="text-xs mt-1" style={{ color: cfg.subColor }}>{cfg.sub(stats)}</p>
        </div>
      ))}
    </div>
  );
}
