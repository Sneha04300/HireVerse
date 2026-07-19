import { useState, useEffect, useRef, useCallback } from "react";
import InterviewSetup from "../components/interview/InterviewSetup";
import InterviewPanel from "../components/interview/InterviewPanel";
import LiveTranscript from "../components/interview/LiveTranscript";
import InterviewReport from "../components/interview/InterviewReport";
import { STATES } from "../components/interview/InterviewStates";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import * as mockInterviewService from "../services/mockInterviewService";
import useAudioRecorder from "../hooks/useAudioRecorder";
import { playAudio, stopAudio } from "../services/piperSpeechService";

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
  const skills = [
    { name: "Communication", score: backendReport.communication, color: "from-purple-500 to-cyan-400" },
    { name: "Confidence", score: backendReport.confidence, color: "from-green-400 to-emerald-500" },
    { name: "Technical", score: backendReport.technical, color: "from-purple-500 to-cyan-400" },
    { name: "Problem Solving", score: backendReport.problemSolving, color: "from-green-400 to-emerald-500" },
  ];

  return {
    overallScore: backendReport.overallScore,
    skills,
    feedback: backendReport.feedback,
    decision: backendReport.verdict,
  };
}

export default function MockInterviewPage() {
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
  const [transcriptReady, setTranscriptReady] = useState(false);

  const timerRef = useRef(null);
  const recorder = useAudioRecorder();

  const speakQuestionViaPiper = useCallback(async (questionText) => {
    if (!interviewId) return;
    setIsAiSpeaking(true);
    try {
      stopAudio();
      const result = await mockInterviewService.speakQuestion(interviewId, questionText);
      await playAudio(`http://localhost:3001${result.url}`);
    } catch (err) {
      console.error("[Piper] Speech generation failed:", err);
    } finally {
      setIsAiSpeaking(false);
    }
  }, [interviewId]);

  useEffect(() => {
    return () => { stopAudio(); };
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
      const { interviewId: id, currentQuestion: question, totalQuestions: total } = data;

      if (!id) throw new Error("interviewId is missing from response");
      if (!question) throw new Error("currentQuestion is missing from response");

      setInterviewId(id);
      setCurrentQuestion(question);
      setCurrentQuestionIndex(0);
      setTotalQuestions(total);
      setTranscriptLines([{ speaker: "AI", text: question }]);
      setElapsed(0);
      setTranscriptReady(false);
      setState(STATES.INTERVIEW);
      setIsProcessing(false);

      await speakQuestionViaPiper(question);
    } catch (err) {
      console.error("[handleStart] error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to start interview. Please try again."
      );
      setIsProcessing(false);
    }
  }, [speakQuestionViaPiper]);

  const handleSubmitAnswer = useCallback(async (answer) => {
    if (!answer.trim() || !interviewId) return;

    recorder.resetTranscript();
    setTranscriptReady(false);
    setIsProcessing(true);
    setError(null);

    try {
      const data = await mockInterviewService.submitAnswer(interviewId, answer);
      const { nextQuestion, currentQuestionIndex: newIdx, isLastQuestion } = data;

      setTranscriptLines((prev) => [...prev, { speaker: "User", text: answer }]);

      if (!isLastQuestion && nextQuestion) {
        setCurrentQuestion(nextQuestion);
        setCurrentQuestionIndex(newIdx);
        setTranscriptLines((prev) => [...prev, { speaker: "AI", text: nextQuestion }]);
        setIsProcessing(false);

        await speakQuestionViaPiper(nextQuestion);
      } else if (isLastQuestion) {
        const endResult = await mockInterviewService.endInterview(interviewId);

        const reportResponse = await mockInterviewService.getReport(interviewId);
        const transformed = transformReport(reportResponse);
        setReport(transformed);
        setCurrentQuestion("");
        setCurrentQuestionIndex(newIdx);
        setState(STATES.COMPLETED);
        setIsProcessing(false);
      } else {
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
  }, [interviewId, speakQuestionViaPiper, recorder]);

  const handleEnd = useCallback(async () => {
    if (!interviewId) return;
    stopAudio();
    setIsProcessing(true);
    setError(null);
    try {
      await mockInterviewService.endInterview(interviewId);

      const reportResponse = await mockInterviewService.getReport(interviewId);
      const transformed = transformReport(reportResponse);
      setReport(transformed);
      setState(STATES.COMPLETED);
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
  }, [interviewId]);

  const showReport = state === STATES.INTERVIEW || state === STATES.COMPLETED;
  const isLoading = isProcessing || isAiSpeaking;
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
              <InterviewSetup onStart={handleStart} pageState={state} />

              <InterviewPanel
                question={currentQuestion ? `"${currentQuestion}"` : null}
                pageState={state}
                isListening={recorder.recordingState === "recording"}
                isAiSpeaking={isAiSpeaking}
              />

              <LiveTranscript
                transcript={formatTranscript(transcriptLines)}
                speechText={recorder.transcript}
                recordingState={recorder.recordingState}
                onStartRecording={recorder.startRecording}
                onStopRecording={recorder.stopRecording}
                elapsed={formatTime(elapsed)}
                questionNum={state === STATES.INTERVIEW || state === STATES.COMPLETED ? currentQuestionIndex + 1 : 1}
                totalQuestions={totalQuestions}
                onEnd={handleEnd}
                onSubmitAnswer={handleSubmitAnswer}
                pageState={state}
                loading={isLoading}
                isAiSpeaking={isAiSpeaking}
                transcriptReady={transcriptReady}
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
