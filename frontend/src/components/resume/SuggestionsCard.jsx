const IconSparkle = () => (
  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5L5 3zM19 9l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
  </svg>
);

export default function SuggestionsCard({ suggestions, onGenerate }) {
  return (
    <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}>
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(6,182,212,0.12)", border: "0.5px solid rgba(6,182,212,0.3)" }}
        >
          <IconSparkle />
        </div>
        <div>
          <h3 className="text-white font-bold text-base leading-snug">AI Suggestions</h3>
          <p className="text-gray-500 text-xs">Powered by HireVerse AI</p>
        </div>
      </div>

      {/* Suggestions list */}
      <div className="flex flex-col gap-3">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
              style={{ background: "rgba(124,58,237,0.2)", border: "0.5px solid rgba(124,58,237,0.4)", color: "#a78bfa" }}
            >
              {i + 1}
            </span>
            <p className="text-gray-300 text-sm leading-relaxed">{s}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onGenerate}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm tracking-wide transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(90deg,#7C3AED,#06B6D4)" }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Generate Improved Resume
      </button>
    </div>
  );
}
