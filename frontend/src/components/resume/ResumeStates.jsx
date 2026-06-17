export function LoadingState() {
  const steps = [
    "Parsing resume structure…",
    "Running ATS keyword match…",
    "Scoring each section…",
    "Generating AI suggestions…",
  ];

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-10">
      {/* Animated ring */}
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 animate-spin" style={{ animationDuration: "2s" }} viewBox="0 0 112 112">
          <defs>
            <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <circle cx="56" cy="56" r="46" fill="none" stroke="#1e2535" strokeWidth="10" />
          <circle cx="56" cy="56" r="46" fill="none" stroke="url(#loadGrad)" strokeWidth="10"
            strokeDasharray="289" strokeDashoffset="217" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-white text-xl font-bold">Analyzing your resume…</h3>
        <p className="text-gray-500 text-sm max-w-xs">HireVerse AI is reviewing every section. This takes about 10 seconds.</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(6,182,212,0.15)", border: "0.5px solid rgba(6,182,212,0.4)" }}
            >
              <svg className="w-2.5 h-2.5 text-cyan-400 animate-pulse" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" />
              </svg>
            </div>
            <span className="text-gray-400 text-sm">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ onUploadClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))", border: "0.5px solid #1e2535" }}
      >
        <svg className="w-9 h-9 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <h3 className="text-white text-xl font-bold mb-2">No resume analyzed yet</h3>
        <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
          Upload your resume above to get your ATS score, keyword analysis, section scores, and AI-powered improvement suggestions.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-2">
        {["ATS Score", "Keyword Gap", "AI Suggestions"].map((f) => (
          <div key={f} className="rounded-xl p-3 text-center" style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}>
            <div className="w-8 h-8 rounded-lg mx-auto mb-2" style={{ background: "rgba(124,58,237,0.12)" }} />
            <p className="text-gray-500 text-xs font-medium">{f}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
