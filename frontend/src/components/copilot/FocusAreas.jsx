export default function FocusAreas({ areas }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.01]"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Focus Areas</p>

      <div className="flex flex-col gap-3.5">
        {areas.map((a) => (
          <div key={a.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)] text-sm">{a.label}</span>
              <span className="text-[var(--text-primary)] text-sm font-bold">{a.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${a.progress}%`, background: a.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
