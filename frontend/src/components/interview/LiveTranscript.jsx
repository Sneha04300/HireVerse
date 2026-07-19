import { useState, useRef, useEffect } from "react";

function RecordingButton({ recordingState, onStart, onStop, disabled }) {
  if (recordingState === "recording") {
    return (
      <button
        onClick={onStop}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-40"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        Stop Recording
      </button>
    );
  }

  if (recordingState === "transcribing") {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600/50 text-white/70 text-sm font-semibold cursor-wait"
      >
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Transcribing...
      </button>
    );
  }

  if (recordingState === "ready") {
    return (
      <button
        onClick={onStart}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700/60 hover:bg-green-700 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-40"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4 0h8" />
        </svg>
        Transcript Ready
      </button>
    );
  }

  return (
    <button
      onClick={onStart}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-40"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="6" />
      </svg>
      Start Recording
    </button>
  );
}

export default function LiveTranscript({
  transcript,
  speechText,
  recordingState,
  onStartRecording,
  onStopRecording,
  elapsed,
  questionNum,
  totalQuestions,
  onEnd,
  onSubmitAnswer,
  pageState,
  loading,
  isAiSpeaking,
  transcriptReady,
}) {
  const [answer, setAnswer] = useState("");
  const [transcriptConfirmed, setTranscriptConfirmed] = useState(false);
  const textareaRef = useRef(null);
  const manuallyEditedRef = useRef(false);
  const isEmpty = pageState === "empty";

  useEffect(() => {
    if (pageState === "interview") {
      setAnswer(speechText || "");
      manuallyEditedRef.current = false;
      setTranscriptConfirmed(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [pageState, questionNum]);

  useEffect(() => {
    if (pageState === "interview" && !manuallyEditedRef.current && speechText) {
      setAnswer(speechText);
    }
  }, [speechText, pageState]);

  const handleSubmit = () => {
    if (!answer.trim() || loading) return;
    onSubmitAnswer(answer.trim());
    manuallyEditedRef.current = false;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleConfirmTranscript = () => {
    setTranscriptConfirmed(true);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const showConfirmButton = transcriptReady && !transcriptConfirmed && answer.trim();

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0f1a]/80 backdrop-blur-sm p-5 shadow-xl mt-4">
      <p className="text-xs font-semibold tracking-widest text-gray-400 mb-3">
        LIVE TRANSCRIPT
      </p>

      <div className="rounded-xl border border-white/8 bg-[#080a14]/60 p-4 min-h-[100px]">
        {isEmpty ? (
          <p className="text-gray-600 text-sm italic">
            Transcript will appear here once the interview starts...
          </p>
        ) : (
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
            {transcript}
          </p>
        )}
      </div>

      {pageState === "interview" && (
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-3">
            <RecordingButton
              recordingState={recordingState}
              onStart={onStartRecording}
              onStop={onStopRecording}
              disabled={loading || isAiSpeaking}
            />
            {recordingState === "recording" && (
              <span className="flex items-center gap-1.5 text-xs text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Recording
              </span>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => {
              manuallyEditedRef.current = true;
              setAnswer(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type or record your answer here..."
            rows={3}
            disabled={loading}
            className="w-full rounded-xl border border-white/10 bg-[#080a14]/80 p-3 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500/50 transition-colors duration-200 disabled:opacity-50"
          />

          <div className="flex items-center justify-between mt-3">
            {showConfirmButton ? (
              <p className="text-xs text-gray-500">
                Review the transcript above, then click Confirm.
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Press <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-gray-400 text-xs">Enter</kbd> to submit
              </p>
            )}

            <div className="flex gap-2">
              {showConfirmButton && (
                <button
                  onClick={handleConfirmTranscript}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/20 transition-all duration-200"
                >
                  Confirm Transcript
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !answer.trim() || (transcriptReady && !transcriptConfirmed)}
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
            {recordingState === "recording" && (
              <>
                <span className="mx-2">•</span>
                <span className="text-green-400">Recording</span>
              </>
            )}
            {isAiSpeaking && (
              <>
                <span className="mx-2">•</span>
                <span className="text-purple-400">AI speaking</span>
              </>
            )}
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
