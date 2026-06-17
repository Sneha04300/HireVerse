export default function KeywordAnalysis({ missingKeywords }) {
  return (
    <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">Missing Keywords</p>
          <h3 className="text-white font-bold text-base">Add these to boost your ATS score</h3>
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
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

      <p className="text-gray-600 text-xs">
        Tip: Naturally weave these into your Skills, Experience, and Project descriptions.
      </p>
    </div>
  );
}
