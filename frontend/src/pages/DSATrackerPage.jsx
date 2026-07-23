import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import StatsCards from "../components/dsa/StatsCards";
import TopicProgress from "../components/dsa/TopicProgress";
import ActivityHeatmap from "../components/dsa/ActivityHeatmap";
import CompanyReadiness from "../components/dsa/CompanyReadiness";
import StruggleAnalysis from "../components/dsa/StruggleAnalysis";
import ContestPerformance from "../components/dsa/ContestPerformance";
import AIInsights from "../components/dsa/AIInsights";
import LeetCodeCard from "../components/dsa/LeetCodeCard";
import DSAReadiness from "../components/dsa/DSAReadiness";
import ProblemModal from "../components/dsa/ProblemModal";
import ProblemsTable from "../components/dsa/ProblemsTable";
import ToastContainer, { useToast } from "../components/dsa/Toast";
import { DSALoadingState, DSAEmptyState, DSAErrorState, DSACoachLoadingState } from "../components/dsa/DSAStates";
import {
  getDSADashboard,
  getDSACoach,
  getAllProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  toggleBookmark,
  incrementRevision,
  getLeetCode,
  connectLeetCode,
} from "../services/dsaService";
import {
  DSA_STATS,
  TOPICS,
  STRUGGLE_ANALYSIS,
  CONTEST_PERFORMANCE,
} from "../data/dsaDummyData";

const TOPIC_COLORS = {
  "Arrays": "#22c55e",
  "Strings": "#22c55e",
  "Hashing": "#06B6D4",
  "Trees": "#06B6D4",
  "Graphs": "#eab308",
  "Dynamic Programming": "#eab308",
  "Linked List": "#a78bfa",
  "Stack": "#a78bfa",
  "Queue": "#a78bfa",
  "Heap": "#f97316",
  "Binary Search": "#06B6D4",
  "Greedy": "#22c55e",
};

const getColor = (topic) => TOPIC_COLORS[topic] || "#a78bfa";

export default function DSATrackerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [coach, setCoach] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [problems, setProblems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [leetcode, setLeetcode] = useState(null);
  const [leetcodeConnecting, setLeetcodeConnecting] = useState(false);
  const { toasts, addToast } = useToast();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getDSADashboard();
      setDashboard(data);
      if (data.overview.totalSolved > 0) {
        setCoachLoading(true);
        getDSACoach()
          .then(setCoach)
          .catch(() => {})
          .finally(() => setCoachLoading(false));
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProblems = useCallback(async () => {
    try {
      const res = await getAllProblems();
      setProblems(res.data || []);
    } catch {
      // silently fail
    }
  }, []);

  const fetchLeetCode = useCallback(async () => {
    try {
      const data = await getLeetCode();
      setLeetcode(data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchLeetCode();
  }, [fetchDashboard, fetchLeetCode]);

  useEffect(() => {
    if (dashboard && dashboard.overview.totalSolved > 0) {
      fetchProblems();
    }
  }, [dashboard, fetchProblems]);

  const handleConnectLeetCode = async (username) => {
    if (!username.trim()) return;
    setLeetcodeConnecting(true);
    try {
      const data = await connectLeetCode(username);
      setLeetcode(data);
      addToast("LeetCode Connected");
    } catch {
      addToast("Failed to connect LeetCode", "error");
    } finally {
      setLeetcodeConnecting(false);
    }
  };

  const isEmpty = dashboard && dashboard.overview.totalSolved === 0;

  const stats = dashboard
    ? {
        problemsSolved: dashboard.overview.totalSolved,
        weeklyGain: dashboard.weeklyProgress.solvedThisWeek,
        currentStreak: dashboard.overview.currentStreak,
        personalBest: dashboard.overview.currentStreak,
        dailyAvg: dashboard.overview.dailyAverage,
        dailyTarget: 4,
        contestRating: dashboard.overview.contestRating,
        maxRating: dashboard.overview.contestRating,
      }
    : DSA_STATS;

  const readinessData = dashboard
    ? {
        score: dashboard.readiness.score,
        strengths: dashboard.readiness.strongestTopics,
        gaps: dashboard.readiness.weakestTopics,
      }
    : { score: 0, strengths: [], gaps: [] };

  const topics = dashboard
    ? dashboard.topicProgress.map((t) => ({
        id: t.topic.toLowerCase().replace(/\s+/g, "-"),
        label: t.topic,
        solved: t.solved,
        total: t.total,
        color: getColor(t.topic),
      }))
    : TOPICS;

  const weekly = dashboard?.weeklyProgress;
  const diff = dashboard?.difficulty;
  const rev = dashboard?.revision;

  const openAddModal = () => {
    setEditingProblem(null);
    setModalOpen(true);
  };

  const openEditModal = (problem) => {
    setEditingProblem(problem);
    setModalOpen(true);
  };

  const handleSave = async (payload, id) => {
    try {
      if (id) {
        await updateProblem(id, payload);
        addToast("Problem Updated");
      } else {
        await createProblem(payload);
        addToast("Problem Added");
      }
      await fetchDashboard();
      await fetchProblems();
    } catch {
      addToast("Something went wrong", "error");
      throw new Error("save failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProblem(id);
      addToast("Problem Deleted");
      await fetchDashboard();
      await fetchProblems();
    } catch {
      addToast("Failed to delete", "error");
    }
  };

  const handleBookmark = async (id) => {
    try {
      await toggleBookmark(id);
      addToast("Bookmark Updated");
      await fetchProblems();
    } catch {
      addToast("Failed to update bookmark", "error");
    }
  };

  const handleRevision = async (id) => {
    try {
      await incrementRevision(id);
      addToast("Revision Added");
      await fetchProblems();
    } catch {
      addToast("Failed to add revision", "error");
    }
  };

  const showTable = dashboard && dashboard.overview.totalSolved > 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient-hero)" }}>
      <Navbar onSidebarToggle={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} />

      <main
        className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarOpen ? "220px" : "0px" }}
      >
        <div className="px-6 py-8 max-w-[1400px]">

          {/* ── Hero ── */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand mb-2">Practice</p>
              <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">DSA Tracker</h1>
              <p className="text-[var(--text-muted)] text-sm mt-2 max-w-xl">
                Track your coding progress, streaks, topic mastery and placement readiness.
              </p>
            </div>
            {showTable && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm tracking-wide transition-opacity hover:opacity-90 btn-gradient"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Problem
              </button>
            )}
          </div>

          {/* ── Loading ── */}
          {loading && <DSALoadingState />}

          {/* ── Error ── */}
          {!loading && error && <DSAErrorState onRetry={fetchDashboard} />}

          {/* ── Empty ── */}
          {!loading && !error && isEmpty && (
            <div className="rounded-2xl" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
              <DSAEmptyState onAddFirst={openAddModal} />
            </div>
          )}

          {/* ── Dashboard ── */}
          {!loading && !error && !isEmpty && dashboard && (
            <div className="flex flex-col gap-6 animate-fade-in">

              {/* Top stat cards */}
              <StatsCards stats={stats} />

              {/* DSA Readiness — large hero card */}
              <DSAReadiness data={readinessData} />

              {/* 2-col: main content + right rail */}
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

                {/* ── Left column ── */}
                <div className="flex flex-col gap-6">

                  {/* Topic Progress + Activity Heatmap in a 2-col grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <TopicProgress topics={topics} />
                    <ActivityHeatmap data={dashboard.activity} />
                  </div>

                  {/* Weekly, Difficulty, Revision cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Weekly Insights */}
                    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Weekly Insights</p>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-tertiary)] text-xs">This Week</span>
                          <span className="text-[var(--text-primary)] font-bold text-lg">{weekly?.solvedThisWeek || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-tertiary)] text-xs">Last Week</span>
                          <span className="text-[var(--text-secondary)] font-semibold text-lg">{weekly?.solvedLastWeek || 0}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-[var(--border)]">
                          <span className="text-[var(--text-tertiary)] text-xs">Improvement</span>
                          <span className={`font-bold text-lg ${(weekly?.improvementPercentage || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {(weekly?.improvementPercentage || 0) >= 0 ? "+" : ""}{weekly?.improvementPercentage || 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Difficulty Distribution */}
                    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Difficulty</p>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400" /> Easy</span>
                          <span className="text-[var(--text-primary)] font-bold">{diff?.easy || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Medium</span>
                          <span className="text-[var(--text-primary)] font-bold">{diff?.medium || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400" /> Hard</span>
                          <span className="text-[var(--text-primary)] font-bold">{diff?.hard || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Revision */}
                    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Revision</p>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-tertiary)] text-xs">Bookmarks</span>
                          <span className="text-[var(--text-primary)] font-bold text-lg">{rev?.totalBookmarks || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-tertiary)] text-xs">Total Revisions</span>
                          <span className="text-[var(--text-primary)] font-bold text-lg">{rev?.totalRevisions || 0}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Struggle Analysis + Contest Performance side by side */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <StruggleAnalysis data={STRUGGLE_ANALYSIS} />
                    <ContestPerformance data={CONTEST_PERFORMANCE} />
                  </div>

                </div>

                {/* ── Right rail ── */}
                <div className="flex flex-col gap-6 xl:sticky xl:top-20 xl:self-start">
                  <CompanyReadiness data={dashboard} />
                  {coachLoading ? <DSACoachLoadingState /> : <AIInsights data={coach} />}
                  <LeetCodeCard data={leetcode} onConnect={handleConnectLeetCode} connecting={leetcodeConnecting} />
                </div>

              </div>

              {/* ── My Problems Table ── */}
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">My Problems</h2>
                <ProblemsTable
                  problems={problems}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onBookmark={handleBookmark}
                  onRevision={handleRevision}
                  onAddFirst={openAddModal}
                />
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Modal */}
      <ProblemModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProblem(null); }}
        onSave={handleSave}
        problem={editingProblem}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
