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
    <div className="min-h-screen bg-[#060810] text-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-white/8 bg-[#060810]/90 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button className="p-1.5 rounded-lg hover:bg-white/8 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2 bg-white/6 rounded-xl px-4 py-2 border border-white/8 w-72">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="bg-transparent text-sm text-gray-400 placeholder-gray-600 outline-none w-full"
              placeholder="Search features, roadmap, companies..."
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-white/8 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-xs font-bold">
              SG
            </div>
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-white">Sneha Gupta</p>
              <p className="text-xs text-gray-500">CSE • 2026</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page Body ── */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
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
      </main>
    </div>
  );
}
