import { useState, useEffect, useRef, useCallback } from "react";
import InterviewSetup from "../components/interview/InterviewSetup";
import InterviewPanel from "../components/interview/InterviewPanel";
import LiveTranscript from "../components/interview/LiveTranscript";
import InterviewReport from "../components/interview/InterviewReport";
import { STATES } from "../components/interview/InterviewStates";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import * as mockInterviewService from "../services/mockInterviewService";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import { speak, stopSpeaking } from "../services/speechService";

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

function transformReport(backendReport) {
  console.log("[transformReport] input:", backendReport);
  const skills = [
    { name: "Communication", score: backendReport.communication, color: "from-purple-500 to-cyan-400" },
    { name: "Confidence", score: backendReport.confidence, color: "from-green-400 to-emerald-500" },
    { name: "Technical", score: backendReport.technical, color: "from-purple-500 to-cyan-400" },
    { name: "Problem Solving", score: backendReport.problemSolving, color: "from-green-400 to-emerald-500" },
  ];

  const transformed = {
    overallScore: backendReport.overallScore,
    skills,
    feedback: backendReport.feedback,
    decision: backendReport.verdict,
  };
  console.log("[transformReport] output:", transformed);
  return transformed;
}

export default function MockInterviewPage() {
  console.log("[FATAL] MockInterviewPage function body entered");

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
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);
  const recog = useSpeechRecognition();

  console.log("[FATAL] recog.start type:", typeof recog.start);
  console.log("[FATAL] window.SpeechRecognition:", window.SpeechRecognition);
  console.log("[FATAL] window.webkitSpeechRecognition:", window.webkitSpeechRecognition);
  console.log("[FATAL] recog.isListening:", recog.isListening);
  console.log("[FATAL] recog.finalText:", JSON.stringify(recog.finalText));
  console.log("[FATAL] recog.interimText:", JSON.stringify(recog.interimText));

  useEffect(() => {
    console.log("[LIFECYCLE] MockInterviewPage MOUNTED (effect running)");
    return () => {
      console.log("[LIFECYCLE] MockInterviewPage CLEANUP (unmount/StrictMode)");
    };
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
    console.log("[TRACE] interviewId changed:", interviewId);
  }, [interviewId]);

  useEffect(() => {
    console.log("[TRACE] transcriptLines updated:", JSON.stringify(transcriptLines, null, 2));
  }, [transcriptLines]);

  useEffect(() => {
    console.log("[TRACE] report state updated:", report);
  }, [report]);

  const handleStart = useCallback(async ({ type, difficulty }) => {
    console.log("=== handleStart called ===");
    console.log("[handleStart] type:", type, "difficulty:", difficulty);
    setError(null);
    setIsProcessing(true);
    try {
      const data = await mockInterviewService.startInterview(type, difficulty);
      const { interviewId: id, currentQuestion: question, totalQuestions: total } = data;

      console.log("[handleStart] interviewId:", id);
      console.log("[handleStart] currentQuestion:", question);
      console.log("[handleStart] totalQuestions:", total);

      if (!id) throw new Error("interviewId is missing from response");
      if (!question) throw new Error("currentQuestion is missing from response");

      setInterviewId(id);
      setCurrentQuestion(question);
      setCurrentQuestionIndex(0);
      setTotalQuestions(total);
      setTranscriptLines([{ speaker: "AI", text: question }]);
      setElapsed(0);
      setState(STATES.INTERVIEW);
      setIsProcessing(false);

      setIsAiSpeaking(true);
      await speak(question);
      setIsAiSpeaking(false);

      stopSpeaking();
      await new Promise((r) => setTimeout(r, 500));

      recog.resetTranscript();

      // ── Proactive microphone permission request ─────────────────────────
      // Browser SpeechRecognition needs an active user gesture context AND
      // microphone permission.  The original gesture (button click) may be
      // lost after async API calls + TTS, so we re-request permission here
      // to ensure the browser's audio pipeline is ready.
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          console.log("[handleStart] Requesting microphone permission via getUserMedia...");
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log("[handleStart] getUserMedia succeeded, got stream id:", stream.id);
          // Release the stream immediately — we only need the permission grant
          stream.getTracks().forEach((t) => t.stop());
          console.log("[handleStart] Microphone tracks released");
        } else {
          console.warn("[handleStart] getUserMedia not available in this browser");
        }
      } catch (micErr) {
        console.error("[handleStart] Microphone permission denied or unavailable:", micErr);
        // Non-fatal — user can still type answers
      }
      
      console.log("BEFORE recog.start()");
      recog.start();
      console.log("AFTER recog.start()")
      console.log("[handleStart] speech recognition started");
    } catch (err) {
      console.error("[handleStart] error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to start interview. Please try again."
      );
      setIsProcessing(false);
    }
  }, [recog]);

  const handleSubmitAnswer = useCallback(async (answer) => {
    console.log("=== handleSubmitAnswer called ===");
    console.log("[handleSubmitAnswer] interviewId:", interviewId);
    console.log("[handleSubmitAnswer] answer:", `"${answer}"`);
    if (!answer.trim() || !interviewId) {
      console.warn("[handleSubmitAnswer] aborted — missing answer or interviewId");
      return;
    }

    recog.stop();
    setIsProcessing(true);
    setError(null);

    try {
      const data = await mockInterviewService.submitAnswer(interviewId, answer);
      const { nextQuestion, currentQuestionIndex: newIdx, isLastQuestion } = data;

      console.log("[handleSubmitAnswer] isLastQuestion:", isLastQuestion);
      console.log("[handleSubmitAnswer] currentQuestionIndex:", newIdx);
      console.log("[handleSubmitAnswer] nextQuestion:", nextQuestion || "(none)");

      setTranscriptLines((prev) => {
        const updated = [...prev, { speaker: "User", text: answer }];
        console.log("[handleSubmitAnswer] transcriptLines after user answer:", JSON.stringify(updated, null, 2));
        return updated;
      });

      if (!isLastQuestion && nextQuestion) {
        setCurrentQuestion(nextQuestion);
        setCurrentQuestionIndex(newIdx);
        setTranscriptLines((prev) => {
          const updated = [...prev, { speaker: "AI", text: nextQuestion }];
          console.log("[handleSubmitAnswer] transcriptLines after AI question:", JSON.stringify(updated, null, 2));
          return updated;
        });
        setIsProcessing(false);

        setIsAiSpeaking(true);
        await speak(nextQuestion);
        setIsAiSpeaking(false);

        stopSpeaking();
        await new Promise((r) => setTimeout(r, 500));

        recog.resetTranscript();
        recog.start();
        console.log("[handleSubmitAnswer] speech recognition restarted for next question");
      } else if (isLastQuestion) {
        console.log("=== Last question submitted — ending interview ===");

        const endResult = await mockInterviewService.endInterview(interviewId);
        console.log("[handleSubmitAnswer] /end result:", endResult);

        const reportResponse = await mockInterviewService.getReport(interviewId);
        console.log("[handleSubmitAnswer] /report result:", reportResponse);

        console.log("[handleSubmitAnswer] calling transformReport with:", reportResponse);
        const transformed = transformReport(reportResponse);
        console.log("[handleSubmitAnswer] transformed report:", transformed);
        setReport(transformed);
        setCurrentQuestion("");
        setCurrentQuestionIndex(newIdx);
        setState(STATES.COMPLETED);
        setIsProcessing(false);
        console.log("[handleSubmitAnswer] state set to COMPLETED");
      } else {
        console.warn("[handleSubmitAnswer] unexpected state — isLastQuestion=false but no nextQuestion");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("[handleSubmitAnswer] ERROR:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to submit answer. Please try again."
      );
      setIsProcessing(false);
    }
  }, [interviewId, recog]);

  const handleEnd = useCallback(async () => {
    console.log("=== handleEnd called ===");
    console.log("[handleEnd] interviewId:", interviewId);
    if (!interviewId) {
      console.warn("[handleEnd] aborted — no interviewId");
      return;
    }
    recog.stop();
    stopSpeaking();
    setIsProcessing(true);
    setError(null);
    try {
      const endResult = await mockInterviewService.endInterview(interviewId);
      console.log("[handleEnd] /end response:", endResult);

      const reportResponse = await mockInterviewService.getReport(interviewId);
      console.log("[handleEnd] /report response:", reportResponse);

      console.log("[handleEnd] calling transformReport with:", reportResponse);
      const transformed = transformReport(reportResponse);
      console.log("[handleEnd] transformed report:", transformed);
      setReport(transformed);
      setState(STATES.COMPLETED);
      console.log("[handleEnd] state set to COMPLETED");
    } catch (err) {
      console.error("[handleEnd] ERROR:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to end interview. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  }, [interviewId, recog]);

  const showReport = state === STATES.INTERVIEW || state === STATES.COMPLETED;
  const isLoading = isProcessing || isAiSpeaking;
  const displayError = error || recog.error;

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
              <InterviewSetup onStart={handleStart} pageState={state} />

              <InterviewPanel
                question={currentQuestion ? `"${currentQuestion}"` : null}
                pageState={state}
                isListening={recog.isListening}
                isAiSpeaking={isAiSpeaking}
              />

              <LiveTranscript
                transcript={formatTranscript(transcriptLines)}
                speechText={recog.finalText}
                interimText={recog.interimText}
                elapsed={formatTime(elapsed)}
                questionNum={state === STATES.INTERVIEW || state === STATES.COMPLETED ? currentQuestionIndex + 1 : 1}
                totalQuestions={totalQuestions}
                onEnd={handleEnd}
                onSubmitAnswer={handleSubmitAnswer}
                pageState={state}
                loading={isLoading}
                isListening={recog.isListening}
                isAiSpeaking={isAiSpeaking}
              />
            </div>

            <div className="xl:sticky xl:top-20 xl:self-start">
              <InterviewReport report={showReport && report ? report : null} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
