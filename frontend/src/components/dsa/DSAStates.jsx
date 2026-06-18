// ── Skeleton building block ──────────────────────────────────────────────────
function Skel({ className = "" }) {
  return (
    <div
      className={`rounded-lg animate-pulse ${className}`}
      style={{ background: "linear-gradient(90deg,#1a1f2e 25%,#222942 50%,#1a1f2e 75%)", backgroundSize: "200% 100%" }}
    />
  );
}

export function DSALoadingState() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl p-5" style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}>
            <Skel className="h-3 w-20 mb-3" />
            <Skel className="h-8 w-16 mb-2" />
            <Skel className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Topic progress skeleton */}
      <div className="rounded-2xl p-6" style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}>
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
      <div className="rounded-2xl p-6" style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}>
        <Skel className="h-3 w-24 mb-5" />
        <Skel className="h-24 w-full" />
      </div>
    </div>
  );
}

export function DSAEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))", border: "0.5px solid #1e2535" }}
      >
        <svg className="w-9 h-9 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      <div>
        <h3 className="text-white text-xl font-bold mb-2">No DSA activity yet</h3>
        <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
          Connect your LeetCode profile or start solving problems to track topic mastery, streaks, and get AI-picked recommendations.
        </p>
      </div>
      <button
        className="px-6 py-3 rounded-xl text-white font-bold text-sm tracking-wide transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(90deg,#7C3AED,#06B6D4)" }}
      >
        Connect LeetCode
      </button>
    </div>
  );
}
