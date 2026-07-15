import { useState, useRef, useEffect } from "react";

export default function LiveTranscript({
  transcript,
  elapsed,
  questionNum,
  totalQuestions,
  onEnd,
  onSubmitAnswer,
  pageState,
  loading,
}) {
  const [answer, setAnswer] = useState("");
  const textareaRef = useRef(null);
  const isEmpty = pageState === "empty";

  useEffect(() => {
    if (pageState === "interview" && textareaRef.current) {
      setAnswer("");
      textareaRef.current.focus();
    }
  }, [pageState, questionNum]);

  const handleSubmit = () => {
    if (!answer.trim() || loading) return;
    onSubmitAnswer(answer.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

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
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
            {transcript}
            {pageState === "interview" && (
              <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-1 animate-pulse rounded-sm align-middle" />
            )}
          </p>
        )}
      </div>

      {/* Answer input — only during interview */}
      {pageState === "interview" && (
        <div className="mt-4">
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here..."
            rows={3}
            disabled={loading}
            className="w-full rounded-xl border border-white/10 bg-[#080a14]/80 p-3 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500/50 transition-colors duration-200 disabled:opacity-50"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500">
              Press <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-gray-400 text-xs">Enter</kbd> to submit
            </p>
            <button
              onClick={handleSubmit}
              disabled={loading || !answer.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:opacity-90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
              {loading ? "Submitting..." : "Submit Answer"}
            </button>
          </div>
        </div>
      )}

      {!isEmpty && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            <span className="text-gray-300">{elapsed || "00:00"} elapsed</span>
            <span className="mx-2">•</span>
            <span className="text-gray-300">
              Question {questionNum || 1} / {totalQuestions || 6}
            </span>
          </p>

          {pageState === "interview" && (
            <button
              onClick={onEnd}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-gray-200 text-sm font-medium transition-all duration-200 disabled:opacity-40"
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
