const TOP_STATS = [
  { key: "participated",  label: "Contests" },
  { key: "bestRank",      label: "Best Rank", prefix: "#" },
  { key: "currentRating", label: "Current Rating" },
  { key: "highestRating", label: "Highest Rating" },
];

export default function ContestPerformance({ data }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Contest Performance</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TOP_STATS.map((s) => (
          <div key={s.key} className="rounded-xl p-3" style={{ background: "#111827", border: "0.5px solid #1e2535" }}>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">{s.label}</p>
            <p className="text-white text-xl font-extrabold">{s.prefix || ""}{data[s.key]}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">Recent Contests</p>
        <div className="flex flex-col gap-2">
          {data.recent.map((c) => (
            <div key={c.name} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "#111827" }}>
              <div>
                <p className="text-gray-200 text-sm font-medium">{c.name}</p>
                <p className="text-gray-600 text-xs">{c.date} · Rank #{c.rank}</p>
              </div>
              <span className={`text-sm font-bold ${c.delta >= 0 ? "text-green-400" : "text-red-400"}`}>
                {c.delta >= 0 ? "+" : ""}{c.delta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
