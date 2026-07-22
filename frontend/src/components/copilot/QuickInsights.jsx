const IconCheck = () => (
  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconTrendUp = () => (
  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const IconAlert = () => (
  <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

export function WeeklyChecklistCard({ checklist }) {
  const done = checklist.filter((c) => c.done).length;

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.01]"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">This Week</p>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: "var(--badge-purple-bg)", border: "0.5px solid var(--badge-purple-border)", color: "var(--badge-purple-text)" }}
        >
          {done}/{checklist.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {checklist.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
              style={{
                background: item.done ? "var(--gradient-brand-subtle)" : "transparent",
                border: item.done ? "none" : "1.5px solid var(--border-focus)",
              }}
            >
              {item.done && <IconCheck />}
            </span>
            <span className={`text-sm ${item.done ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QuickInsights({ insights }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.01]"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">AI Insights</p>

      <div className="flex flex-col gap-3">
        {insights.map((insight) => (
          <div key={insight.id} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex-shrink-0">
              {insight.type === "positive" ? <IconTrendUp /> : <IconAlert />}
            </span>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
