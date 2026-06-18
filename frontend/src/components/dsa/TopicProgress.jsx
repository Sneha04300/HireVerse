function TopicBar({ topic }) {
  const pct = Math.round((topic.solved / topic.total) * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-gray-300 text-sm">{topic.label}</span>
        <span className="text-white text-sm font-bold">{pct}%</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: "#1e2535" }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: topic.color }}
        />
      </div>
      <span className="text-gray-600 text-xs">{topic.solved}/{topic.total} solved</span>
    </div>
  );
}

export default function TopicProgress({ topics }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}
    >
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Topic Progress</p>
        <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
          View all →
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
        {topics.map((t) => (
          <TopicBar key={t.id} topic={t} />
        ))}
      </div>
    </div>
  );
}
