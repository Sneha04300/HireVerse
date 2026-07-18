export default function InterviewPanel({ question, pageState, isListening, isAiSpeaking }) {
  const isActive = pageState === "interview";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0f1a]/80 backdrop-blur-sm p-5 shadow-xl">
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-700 to-purple-500 shadow-lg shadow-purple-500/40 ${
              isActive ? "animate-pulse" : ""
            }`}
          >
            <div className="absolute inset-0 rounded-full border-2 border-purple-400/40" />
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold tracking-widest text-gray-400 mb-1">
            AI RECRUITER
          </p>
          <p className="text-xl font-semibold text-white leading-snug">
            {question || '"Tell me about yourself."'}
          </p>
        </div>

        <div className="flex-shrink-0 flex gap-2">
          {isListening && (
            <span className="px-3 py-1.5 rounded-full border border-green-500/60 bg-green-500/10 text-green-400 text-xs font-semibold">
              Mic on
            </span>
          )}
          {isAiSpeaking && (
            <span className="px-3 py-1.5 rounded-full border border-purple-500/60 bg-purple-500/10 text-purple-400 text-xs font-semibold">
              Speaking
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
