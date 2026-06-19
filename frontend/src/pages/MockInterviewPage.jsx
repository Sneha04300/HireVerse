import { useState, useEffect, useRef } from "react";
import InterviewSetup from "../components/interview/InterviewSetup";
import InterviewPanel from "../components/interview/InterviewPanel";
import LiveTranscript from "../components/interview/LiveTranscript";
import InterviewReport from "../components/interview/InterviewReport";
import { STATES } from "../components/interview/InterviewStates";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import {
  interviewQuestions,
  liveTranscript,
  reportData,
} from "../data/mockInterviewDummyData";

// ── Change this to "empty" | "interview" | "completed" to preview states ──
const PAGE_STATE = "completed";

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function MockInterviewPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [state, setState] = useState(PAGE_STATE);
  const [elapsed, setElapsed] = useState(42);
  const [questionIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (state === STATES.INTERVIEW) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [state]);

  const handleStart = () => {
    setElapsed(0);
    setState(STATES.INTERVIEW);
  };

  const handleEnd = () => {
    setState(STATES.COMPLETED);
  };

  const showReport = state === STATES.INTERVIEW || state === STATES.COMPLETED;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#0a0d18 0%,#080f1a 50%,#050d14 100%)" }}>
      <Navbar onSidebarToggle={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} />

      <main
        className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarOpen ? "220px" : "0px" }}
      >
        <div className="px-6 py-8 max-w-[1400px]">

          {/* Page header */}
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest text-cyan-500 mb-1">PRACTICE</p>
            <h1 className="text-4xl font-bold text-white mb-1">AI Mock Interview</h1>
            <p className="text-gray-400 text-sm">
              Real recruiter-style interviews with live transcript and post-call report.
            </p>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
            {/* Left column */}
            <div className="flex flex-col gap-4">
              {/* Setup */}
              <InterviewSetup onStart={handleStart} pageState={state} />

              {/* Recruiter panel */}
              <InterviewPanel
                question={`"${interviewQuestions[questionIdx].text}"`}
                pageState={state}
              />

              {/* Transcript */}
              <LiveTranscript
                transcript={liveTranscript}
                elapsed={formatTime(elapsed)}
                questionNum={questionIdx + 1}
                totalQuestions={interviewQuestions.length}
                onEnd={handleEnd}
                pageState={state}
              />
            </div>

            {/* Right column - sticky report */}
            <div className="xl:sticky xl:top-20 xl:self-start">
              <InterviewReport report={showReport ? reportData : null} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
