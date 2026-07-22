export default function KeywordAnalysis({ missingKeywords = [] }) {
  return (
    <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)] mb-1">Missing Keywords</p>
          <h3 className="text-[var(--text-primary)] font-bold text-base truncate">Add these to boost your ATS score</h3>
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0"
          style={{ background: "rgba(239,68,68,0.12)", border: "0.5px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
        >
          {missingKeywords.length} missing
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {missingKeywords.map((kw) => (
          <span
            key={kw}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg cursor-default hover:border-red-500/60 transition-colors"
            style={{ background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}
          >
            <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {kw}
          </span>
        ))}
      </div>

      <p className="text-[var(--text-tertiary)] text-xs">
        Tip: Naturally weave these into your Skills, Experience, and Project descriptions.
      </p>
    </div>
  );
}
