function Skel({ className = "" }) {
  return (
    <div
      className={`rounded-lg animate-pulse ${className}`}
      style={{ background: "linear-gradient(90deg,var(--bg-elevated) 25%,var(--bg-hover) 50%,var(--bg-elevated) 75%)", backgroundSize: "200% 100%" }}
    />
  );
}

export function CopilotLoadingState() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
      {/* Left skeleton */}
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
          <div className="flex flex-col gap-5">
            <div className="flex justify-end">
              <Skel className="h-12 w-2/3" />
            </div>
            <div className="flex gap-3">
              <Skel className="h-8 w-8 rounded-full flex-shrink-0" />
              <Skel className="h-20 w-3/4" />
            </div>
            <div className="flex gap-3">
              <Skel className="h-8 w-8 rounded-full flex-shrink-0" />
              <Skel className="h-40 w-3/4" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
          <Skel className="h-3 w-32 mb-4" />
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3, 4].map((i) => <Skel key={i} className="h-12 w-full" />)}
          </div>
        </div>
      </div>

      {/* Right skeleton */}
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
            <Skel className="h-3 w-28 mb-4" />
            <Skel className="h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CopilotEmptyState({ onPromptClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))", border: "0.5px solid var(--border)" }}
      >
        <svg className="w-9 h-9 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5L5 3zM19 9l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
        </svg>
      </div>
      <div>
        <h3 className="text-[var(--text-primary)] text-xl font-bold mb-2">Ask your first career question.</h3>
        <p className="text-[var(--text-muted)] text-sm max-w-sm leading-relaxed">
          Career Copilot is trained on your profile, resume, DSA progress, and mock interview history — ask it anything about your placement journey.
        </p>
      </div>
      <button
        onClick={() => onPromptClick?.("Build me a 30-day Amazon prep plan")}
        className="px-6 py-3 rounded-xl text-white font-bold text-sm tracking-wide transition-opacity hover:opacity-90 btn-gradient"
      >
        Try a suggested prompt
      </button>
    </div>
  );
}
