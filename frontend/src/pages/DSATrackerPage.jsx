import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import StatsCards from "../../../../../../Downloads/hireverse-dsa-tracker/hireverse/src/components/dsa/StatsCards";
import TopicProgress from "../../../../../../Downloads/hireverse-dsa-tracker/hireverse/src/components/dsa/TopicProgress";
import ActivityHeatmap from "../../../../../../Downloads/hireverse-dsa-tracker/hireverse/src/components/dsa/ActivityHeatmap";
import AIInsights from "../../../../../../Downloads/hireverse-dsa-tracker/hireverse/src/components/dsa/AIInsights";
import SuggestedProblems from "../../../../../../Downloads/hireverse-dsa-tracker/hireverse/src/components/dsa/SuggestedProblems";
import TopicBreakdown from "../../../../../../Downloads/hireverse-dsa-tracker/hireverse/src/components/dsa/TopicBreakdown";
import StruggleAnalysis from "../../../../../../Downloads/hireverse-dsa-tracker/hireverse/src/components/dsa/StruggleAnalysis";
import ContestPerformance from "../../../../../../Downloads/hireverse-dsa-tracker/hireverse/src/components/dsa/ContestPerformance";
import LeetCodeCard from "../../../../../../Downloads/hireverse-dsa-tracker/hireverse/src/components/dsa/LeetCodeCard";
import GoalsCard from "../../../../../../Downloads/hireverse-dsa-tracker/hireverse/src/components/dsa/GoalsCard";
import DSAReadiness from "../../../../../../Downloads/hireverse-dsa-tracker/hireverse/src/components/dsa/DSAReadiness";
import { DSALoadingState, DSAEmptyState } from "../../../../../../Downloads/hireverse-dsa-tracker/hireverse/src/components/dsa/DSAStates";
import {
  DSA_STATS,
  TOPICS,
  HEATMAP_DATA,
  AI_INSIGHTS,
  SUGGESTED_PROBLEMS,
  STRUGGLE_ANALYSIS,
  CONTEST_PERFORMANCE,
  LEETCODE,
  WEEKLY_GOALS,
  DSA_READINESS,
} from "../../../../../../Downloads/hireverse-dsa-tracker/hireverse/src/data/dsaDummyData";

// Toggle this to preview states quickly: "loading" | "empty" | "data"
const PAGE_STATE = "data";

export default function DSATrackerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(PAGE_STATE === "loading");
  const isEmpty = PAGE_STATE === "empty";

  useEffect(() => {
    if (PAGE_STATE !== "loading") return;
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#0a0d18 0%,#080f1a 50%,#050d14 100%)" }}>
      <Navbar onSidebarToggle={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} />

      <main
        className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarOpen ? "220px" : "0px" }}
      >
        <div className="px-6 py-8 max-w-[1400px]">

          {/* ── Hero ── */}
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 mb-2">Practice</p>
            <h1 className="text-3xl font-extrabold text-white">DSA Tracker</h1>
            <p className="text-gray-500 text-sm mt-2 max-w-xl">
              Track your coding progress, streaks, topic mastery and placement readiness.
            </p>
          </div>

          {/* ── States ── */}
          {loading && <DSALoadingState />}

          {!loading && isEmpty && (
            <div className="rounded-2xl" style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}>
              <DSAEmptyState />
            </div>
          )}

          {!loading && !isEmpty && (
            <div className="flex flex-col gap-6 animate-fade-in">

              {/* Top stat cards */}
              <StatsCards stats={DSA_STATS} />

              {/* DSA Readiness — large hero card */}
              <DSAReadiness data={DSA_READINESS} />

              {/* 2-col: main content + right rail */}
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

                {/* ── Left column ── */}
                <div className="flex flex-col gap-6">

                  {/* Topic Progress */}
                  <TopicProgress topics={TOPICS} />

                  {/* Activity Heatmap */}
                  {/* <ActivityHeatmap data={HEATMAP_DATA} /> */}

                  {/* Topic Breakdown table
                  <TopicBreakdown topics={TOPICS} /> */}

                  {/* Struggle Analysis + Contest Performance side by side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StruggleAnalysis data={STRUGGLE_ANALYSIS} />
                    <ContestPerformance data={CONTEST_PERFORMANCE} />
                  </div>

                  {/* Suggested Problems */}
                  {/* <SuggestedProblems problems={SUGGESTED_PROBLEMS} /> */}

                </div>

                {/* ── Right rail ── */}
                <div className="flex flex-col gap-6 xl:sticky xl:top-20 xl:self-start">
                  <AIInsights insights={AI_INSIGHTS} />
                  <LeetCodeCard data={LEETCODE} />
                  {/* <GoalsCard goals={WEEKLY_GOALS} /> */}
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
