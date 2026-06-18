export default function LiveTranscript({ transcript, elapsed, questionNum, totalQuestions, onEnd, pageState }) {
  const isEmpty = pageState === "empty";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0f1a]/80 backdrop-blur-sm p-5 shadow-xl mt-4">
      <p className="text-xs font-semibold tracking-widest text-gray-400 mb-3">
        LIVE TRANSCRIPT
      </p>

      <div className="rounded-xl border border-white/8 bg-[#080a14]/60 p-4 min-h-[100px] flex items-start">
        {isEmpty ? (
          <p className="text-gray-600 text-sm italic">
            Transcript will appear here once the interview starts...
          </p>
        ) : (
          <p className="text-gray-200 text-sm leading-relaxed">
            {transcript}
            {pageState === "interview" && (
              <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-1 animate-pulse rounded-sm align-middle" />
            )}
          </p>
        )}
      </div>

      {!isEmpty && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            <span className="text-gray-300">{elapsed || "00:42"} elapsed</span>
            <span className="mx-2">•</span>
            <span className="text-gray-300">
              Question {questionNum || 1} / {totalQuestions || 6}
            </span>
          </p>

          {pageState === "interview" && (
            <button
              onClick={onEnd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-gray-200 text-sm font-medium transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
              End Interview
            </button>
          )}
        </div>
      )}
    </div>
  );
}
