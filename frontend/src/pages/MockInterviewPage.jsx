import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InterviewSetup from "../components/interview/InterviewSetup";
import InterviewPanel from "../components/interview/InterviewPanel";
import LiveTranscript from "../components/interview/LiveTranscript";
import InterviewReport from "../components/interview/InterviewReport";
import { STATES } from "../components/interview/InterviewStates";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import * as mockInterviewService from "../services/mockInterviewService";
import useAudioRecorder from "../hooks/useAudioRecorder";

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function formatTranscript(transcriptLines) {
  return transcriptLines
    .map((line) => `${line.speaker}: "${line.text}"`)
    .join("\n\n");
}

export default function MockInterviewPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [state, setState] = useState(STATES.EMPTY);
  const [interviewId, setInterviewId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(6);
  const [transcriptLines, setTranscriptLines] = useState([]);
  const [report, setReport] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [transcriptReady, setTranscriptReady] = useState(false);

  const timerRef = useRef(null);
  const recorder = useAudioRecorder();

  useEffect(() => {
    return () => {};
  }, []);

  useEffect(() => {
    if (state === STATES.INTERVIEW) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [state]);

  useEffect(() => {
    if (recorder.recordingState === "ready" && recorder.transcript) {
      setTranscriptReady(true);
    }
  }, [recorder.recordingState, recorder.transcript]);

  const handleStart = useCallback(async ({ type, difficulty }) => {
    setError(null);
    setIsProcessing(true);
    try {
      const data = await mockInterviewService.startInterview(type, difficulty);
      const { interviewId: id, question, questionNumber, audioUrl } = data;

      if (!id) throw new Error("interviewId is missing from response");
      if (!question) throw new Error("question is missing from response");

      setInterviewId(id);
      setCurrentQuestion(question);
      setCurrentQuestionIndex(questionNumber - 1);
      setTotalQuestions(6);
      setTranscriptLines([{ speaker: "AI", text: question }]);
      setElapsed(0);
      setTranscriptReady(false);
      setReport(null);
      setState(STATES.INTERVIEW);
      setIsProcessing(false);

      if (audioUrl) {
        const BACKEND_URL = "http://localhost:3001";
        const fullUrl = audioUrl.startsWith("/") ? `${BACKEND_URL}${audioUrl}` : audioUrl;
        try {
          const audio = new Audio(fullUrl);
          await audio.play();
        } catch (playErr) {
          console.error("[Audio] Playback failed:", playErr.message);
        }
      }
    } catch (err) {
      console.error("[handleStart] error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to start interview. Please try again."
      );
      setIsProcessing(false);
    }
  }, []);

  const handleSubmitAnswer = useCallback(async (answer) => {
    if (!answer.trim() || !interviewId) return;

    recorder.resetTranscript();
    setTranscriptReady(false);
    setIsProcessing(true);
    setError(null);

    try {
      const data = await mockInterviewService.submitAnswer(interviewId, answer);

      console.log("[Interview] Answer submitted");

      setTranscriptLines((prev) => [...prev, { speaker: "User", text: answer }]);

      if (data.report) {
        setReport(data.report);
        setTranscriptLines((prev) => [...prev, { speaker: "AI", text: "Interview completed. Generating report..." }]);
        setState(STATES.COMPLETED);
        setIsProcessing(false);
        return;
      }

      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setCurrentQuestionIndex(data.nextQuestionNumber - 1);
        setTranscriptLines((prev) => [...prev, { speaker: "AI", text: data.nextQuestion }]);

        if (data.audioUrl) {
          const BACKEND_URL = "http://localhost:3001";
          const fullUrl = data.audioUrl.startsWith("/") ? `${BACKEND_URL}${data.audioUrl}` : data.audioUrl;
          const audio = new Audio(fullUrl);
          audio.play();
        }
      }

      setIsProcessing(false);
    } catch (err) {
      console.error("[handleSubmitAnswer] ERROR:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to submit answer. Please try again."
      );
      setIsProcessing(false);
    }
  }, [interviewId, recorder]);

  const handleRetake = useCallback(() => {
    recorder.resetTranscript();
    setReport(null);
    setInterviewId(null);
    setCurrentQuestion("");
    setCurrentQuestionIndex(0);
    setTranscriptLines([]);
    setElapsed(0);
    setTranscriptReady(false);
    setError(null);
    setState(STATES.EMPTY);
  }, [recorder]);

  const isLoading = isProcessing;
  const displayError = error || recorder.error;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#0a0d18 0%,#080f1a 50%,#050d14 100%)" }}>
      <Navbar onSidebarToggle={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} />

      <main
        className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarOpen ? "220px" : "0px" }}
      >
        <div className="px-6 py-8 max-w-[1400px]">

          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest text-cyan-500 mb-1">PRACTICE</p>
            <h1 className="text-4xl font-bold text-white mb-1">AI Mock Interview</h1>
            <p className="text-gray-400 text-sm">
              Real recruiter-style interviews with live transcript and post-call report.
            </p>
          </div>

          {displayError && (
            <div className="mb-4 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
              {displayError}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
            <div className="flex flex-col gap-4">
              <InterviewSetup onStart={handleStart} pageState={state} onRetake={handleRetake} />

              {state !== STATES.COMPLETED && (
                <>
                  <InterviewPanel
                    question={currentQuestion ? `"${currentQuestion}"` : null}
                    pageState={state}
                    isListening={recorder.recordingState === "recording"}
                    isAiSpeaking={false}
                  />

                  <LiveTranscript
                    transcript={formatTranscript(transcriptLines)}
                    speechText={recorder.transcript}
                    recordingState={recorder.recordingState}
                    onStartRecording={recorder.startRecording}
                    onStopRecording={recorder.stopRecording}
                    elapsed={formatTime(elapsed)}
                    questionNum={state === STATES.INTERVIEW ? currentQuestionIndex + 1 : 1}
                    totalQuestions={totalQuestions}
                    onSubmitAnswer={handleSubmitAnswer}
                    pageState={state}
                    loading={isLoading}
                    isAiSpeaking={false}
                    transcriptReady={transcriptReady}
                  />
                </>
              )}

              {state === STATES.COMPLETED && report && (
                <InterviewReport
                  report={report}
                  elapsed={formatTime(elapsed)}
                  onRetake={handleRetake}
                  fullWidth
                />
              )}
            </div>

            <div className="xl:sticky xl:top-20 xl:self-start">
              {state === STATES.COMPLETED && report ? (
                <div className="rounded-2xl border border-white/10 bg-[#0d0f1a]/80 backdrop-blur-sm p-5 shadow-xl">
                  <p className="text-xs font-semibold tracking-widest text-gray-400 mb-4">
                    INTERVIEW SUMMARY
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {report.summary}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Duration:</span>
                    <span className="text-sm font-semibold text-gray-200">{formatTime(elapsed)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Difficulty:</span>
                    <span className="text-sm font-semibold text-gray-200">{report.difficultyLevel}</span>
                  </div>
                </div>
              ) : (
                <InterviewReport report={null} />
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
