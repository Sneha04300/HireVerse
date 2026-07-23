export default function StruggleAnalysis({ data }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Struggle Analysis</p>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.25)" }}>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Most Failed</p>
          <p className="text-red-400 font-bold text-base">{data?.mostFailed ?? "—"}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "rgba(234,179,8,0.08)", border: "0.5px solid rgba(234,179,8,0.25)" }}>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Avg Attempts</p>
          <p className="text-yellow-400 font-bold text-base">{data?.avgAttempts ?? 0}×</p>
        </div>
      </div>

      {/* Weak patterns */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Weak Patterns</p>
        <div className="flex flex-wrap gap-2">
          {(data?.weakPatterns ?? []).map((p) => (
            <span
              key={p}
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)", color: "var(--text-secondary)" }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Most retried problems */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Most Retried Problems</p>
        <div className="flex flex-col gap-2">
          {(data?.mostRetried ?? []).map((p) => (
            <div key={p.name} className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)] text-sm">{p.name}</span>
              <span className="text-orange-400 text-xs font-bold">{p.attempts} attempts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
