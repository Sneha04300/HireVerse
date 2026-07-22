// ── Skeleton building block ──────────────────────────────────────────────────
function Skel({ className = "" }) {
  return (
    <div
      className={`rounded-lg animate-pulse ${className}`}
      style={{ background: "linear-gradient(90deg,var(--bg-elevated) 25%,var(--bg-hover) 50%,var(--bg-elevated) 75%)", backgroundSize: "200% 100%" }}
    />
  );
}

export function DSALoadingState() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
            <Skel className="h-3 w-20 mb-3" />
            <Skel className="h-8 w-16 mb-2" />
            <Skel className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Topic progress skeleton */}
      <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
        <Skel className="h-3 w-32 mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex justify-between">
                <Skel className="h-3 w-20" />
                <Skel className="h-3 w-10" />
              </div>
              <Skel className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap skeleton */}
      <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
        <Skel className="h-3 w-24 mb-5" />
        <Skel className="h-24 w-full" />
      </div>
    </div>
  );
}

export function DSAEmptyState({ onAddFirst }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))", border: "0.5px solid var(--border)" }}
      >
        <svg className="w-9 h-9 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      <div>
        <h3 className="text-[var(--text-primary)] text-xl font-bold mb-2">No DSA problems tracked yet</h3>
        <p className="text-[var(--text-muted)] text-sm max-w-sm leading-relaxed">
          Start solving problems and log them to track topic mastery, streaks, and progress.
        </p>
      </div>
      <button
        onClick={onAddFirst}
        className="px-6 py-3 rounded-xl text-white font-bold text-sm tracking-wide transition-opacity hover:opacity-90 btn-gradient"
      >
        Add First Problem
      </button>
    </div>
  );
}

export function DSACoachLoadingState() {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(6,182,212,0.12)", border: "0.5px solid rgba(6,182,212,0.3)" }}
        >
          <svg className="w-5 h-5 text-brand animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5L5 3zM19 9l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
          </svg>
        </div>
        <h3 className="text-[var(--text-primary)] font-bold text-base">AI Coach</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <p className="text-[var(--text-muted)] text-sm">Analyzing your coding journey...</p>
      </div>
    </div>
  );
}

export function DSAErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.3)" }}
      >
        <svg className="w-9 h-9 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div>
        <h3 className="text-[var(--text-primary)] text-xl font-bold mb-2">Failed to load dashboard</h3>
        <p className="text-[var(--text-muted)] text-sm max-w-sm leading-relaxed">
          Something went wrong while fetching your DSA data.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="px-6 py-3 rounded-xl text-white font-bold text-sm tracking-wide transition-opacity hover:opacity-90 btn-gradient"
      >
        Retry
      </button>
    </div>
  );
}
