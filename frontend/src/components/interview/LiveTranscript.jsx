import { useState, useRef, useEffect } from "react";

function RecordingButton({ recordingState, onStart, onStop, disabled }) {
  console.log("[RecordingButton] RENDER recordingState:", recordingState, "disabled:", disabled, "onStart type:", typeof onStart);
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

  console.log("[RecordingButton] RENDERING idle (Start Recording) | disabled:", disabled, "| onStart type:", typeof onStart);
  return (
    <button
      onClick={(e) => {
        console.log("[RecordingButton] 'Start Recording' CLICKED, disabled prop is:", disabled, "| onStart type:", typeof onStart);
        if (typeof onStart === "function") {
          console.log("[RecordingButton] Calling onStart() now");
          onStart();
        } else {
          console.error("[RecordingButton] onStart is NOT a function! Value:", onStart);
        }
      }}
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
  console.log("[LiveTranscript] RENDER answer:", answer, "speechText:", JSON.stringify(speechText), "loading:", loading, "| recordingState:", recordingState, "| pageState:", pageState, "| transcriptReady:", transcriptReady);
  const textareaRef = useRef(null);
  const manuallyEditedRef = useRef(false);
  const isEmpty = pageState === "empty";

  useEffect(() => {
    console.log("[LiveTranscript] Effect 1 (pageState/questionNum) fired — pageState:", pageState, "questionNum:", questionNum, "speechText:", JSON.stringify(speechText), "manuallyEditedRef.current:", manuallyEditedRef.current);
    if (pageState === "interview") {
      setAnswer(speechText || "");
      manuallyEditedRef.current = false;
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState, questionNum]);

  useEffect(() => {
    const shouldSet = pageState === "interview" && !manuallyEditedRef.current && speechText;
    console.log("[LiveTranscript] Effect 2 (speechText/pageState) fired — speechText:", JSON.stringify(speechText), "pageState:", pageState, "manuallyEditedRef.current:", manuallyEditedRef.current, "shouldSetAnswer:", shouldSet);
    if (shouldSet) {
      console.log("[LiveTranscript] Effect 2 — calling setAnswer(speechText):", JSON.stringify(speechText));
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

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-sm p-5 shadow-xl mt-4">
      <p className="text-xs font-semibold tracking-widest text-[var(--text-tertiary)] mb-3">
        LIVE TRANSCRIPT
      </p>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)]/60 p-4 min-h-[100px]">
        {isEmpty ? (
          <p className="text-[var(--text-muted)] text-sm italic">
            Transcript will appear here once the interview starts...
          </p>
        ) : (
          <p className="text-[var(--text-primary)] text-sm leading-relaxed whitespace-pre-line">
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
            {transcriptReady && recordingState !== "recording" && recordingState !== "transcribing" && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Transcript Ready
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
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)]/80 p-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none focus:border-purple-500/50 transition-colors duration-200 disabled:opacity-50"
          />

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-[var(--text-muted)]">
              Press <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-hover)] text-[var(--text-tertiary)] text-xs">Enter</kbd> to submit
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={loading || !answer.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-brand text-white text-sm font-semibold shadow-lg-custom hover:opacity-90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
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
          <p className="text-xs text-[var(--text-muted)]">
            <span className="text-[var(--text-secondary)]">{elapsed || "00:00"} elapsed</span>
            <span className="mx-2">•</span>
            <span className="text-[var(--text-secondary)]">
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm font-medium transition-all duration-200 disabled:opacity-40"
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
