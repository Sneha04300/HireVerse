function TopicBar({ topic }) {
  const pct = Math.round((topic.solved / topic.total) * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[var(--text-secondary)] text-sm">{topic.label}</span>
        <span className="text-[var(--text-primary)] text-sm font-bold">{pct}%</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: "var(--border)" }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: topic.color }}
        />
      </div>
      <span className="text-[var(--text-muted)] text-xs">{topic.solved}/{topic.total} solved</span>
    </div>
  );
}

export default function TopicProgress({ topics }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Topic Progress</p>
        <span className="text-sm font-medium transition-colors cursor-default" style={{ color: "var(--brand-secondary)" }}>
          View all →
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
        {topics.map((t) => (
          <TopicBar key={t.id} topic={t} />
        ))}
      </div>
    </div>
  );
}
