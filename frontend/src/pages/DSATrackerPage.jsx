import { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import StatsCards from "../components/dsa/StatsCards";
import ActivityHeatmap from "../components/dsa/ActivityHeatmap";
import CompanyReadiness from "../components/dsa/CompanyReadiness";
import AIInsights from "../components/dsa/AIInsights";
import LeetCodeCard from "../components/dsa/LeetCodeCard";
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

const TOPICS = [
  "Arrays", "Strings", "Hashing", "Linked List", "Stack", "Queue",
  "Trees", "BST", "Graphs", "DP", "Greedy", "Heap", "Trie",
  "Backtracking", "Sliding Window", "Binary Search", "Math", "Bit Manipulation",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STATUSES = ["Solved", "Attempted", "Revising"];

function Card({ title, titleColor, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-3 ${className}`}
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <p className={`text-[11px] font-semibold uppercase tracking-widest ${titleColor || "text-[var(--text-muted)]"}`}>{title}</p>
      {children}
    </div>
  );
}

function WhereLosingTime({ problems }) {
  const rows = useMemo(() => {
    const map = {};
    for (const p of problems) {
      if (!p.timeTaken) continue;
      for (const t of p.topic || []) {
        if (!map[t]) map[t] = { total: 0, count: 0 };
        map[t].total += p.timeTaken;
        map[t].count += 1;
      }
    }
    return Object.entries(map)
      .map(([topic, d]) => ({ topic, avg: Math.round(d.total / d.count), count: d.count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
  }, [problems]);

  if (rows.length === 0) {
    return (
      <p className="text-[var(--text-muted)] text-sm">
        No time data yet. Add time spent per problem to see where your time goes.
      </p>
    );
  }

  const max = Math.max(...rows.map((r) => r.avg), 1);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((r) => (
        <div key={r.topic} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-primary)] font-medium">{r.topic}</span>
            <span className="text-[var(--text-secondary)] font-semibold">{r.avg}m avg</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
            <div className="h-1.5 rounded-full" style={{ width: `${(r.avg / max) * 100}%`, background: "#f97316" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MostRetried({ problems }) {
  const rows = [...problems]
    .filter((p) => (p.revisionCount || 0) > 0 || (p.attempts || 0) > 1)
    .sort((a, b) => (b.revisionCount || 0) - (a.revisionCount || 0) || (b.attempts || 0) - (a.attempts || 0))
    .slice(0, 5);

  if (rows.length === 0) {
    return <p className="text-[var(--text-muted)] text-sm">No retried problems yet. Revise problems to build consistency.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((p) => (
        <div key={p._id} className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)] text-sm truncate pr-2">{p.title}</span>
          <span className="text-orange-400 text-xs font-bold flex-shrink-0">
            {(p.revisionCount || 0) > 0 ? `${p.revisionCount} revis` : `${p.attempts} att`}
          </span>
        </div>
      ))}
    </div>
  );
}

function DifficultySplit({ data }) {
  const items = [
    { label: "Easy", value: data?.easy || 0, color: "#22c55e" },
    { label: "Medium", value: data?.medium || 0, color: "#eab308" },
    { label: "Hard", value: data?.hard || 0, color: "#ef4444" },
  ];
  const total = items.reduce((s, i) => s + i.value, 0) || 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        {items.map((i) => (
          <div key={i.label} style={{ width: `${(i.value / total) * 100}%`, background: i.color }} />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {items.map((i) => (
          <div key={i.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full" style={{ background: i.color }} />
              {i.label}
            </span>
            <span className="text-[var(--text-primary)] font-bold">{i.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklyInsights({ data }) {
  const pct = data?.improvementPercentage || 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-[var(--text-tertiary)] text-xs">This Week</span>
        <span className="text-[var(--text-primary)] font-bold text-lg">{data?.solvedThisWeek || 0}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[var(--text-tertiary)] text-xs">Last Week</span>
        <span className="text-[var(--text-secondary)] font-semibold text-lg">{data?.solvedLastWeek || 0}</span>
      </div>
      <div className="flex justify-between items-center pt-1 border-t border-[var(--border)]">
        <span className="text-[var(--text-tertiary)] text-xs">Improvement</span>
        <span className={`font-bold text-lg ${pct >= 0 ? "text-green-400" : "text-red-400"}`}>
          {pct >= 0 ? "+" : ""}{pct}%
        </span>
      </div>
    </div>
  );
}

function RecentContests({ leetcode, contestRating }) {
  const contests = leetcode?.recentContests || [];
  if (contests.length === 0) {
    return (
      <p className="text-[var(--text-muted)] text-sm">
        {leetcode
          ? "No recent contest data available."
          : `Current rating ${contestRating || "—"}. Connect LeetCode to see contest history.`}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {contests.slice(0, 5).map((c, i) => (
        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
          <div className="min-w-0">
            <p className="text-[var(--text-primary)] text-sm font-medium truncate">{c.title}</p>
            {c.rank != null && <p className="text-[var(--text-muted)] text-xs">Rank #{c.rank}</p>}
          </div>
          <span className="text-[var(--brand-secondary)] text-sm font-bold flex-shrink-0 ml-2">{c.rating}</span>
        </div>
      ))}
    </div>
  );
}

function ProblemEntry({ filters, onChange, onAdd }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-wrap items-center gap-3"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[180px] flex-shrink-0">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          placeholder="Search problems..."
          className="input-field w-full"
        />
      </div>

      {/* Difficulty */}
      <select
        value={filters.difficulty}
        onChange={(e) => onChange("difficulty", e.target.value)}
        className="input-field w-auto flex-shrink-0"
        style={{ paddingLeft: "1rem" }}
      >
        <option value="">All Difficulty</option>
        {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>

      {/* Topic */}
      <select
        value={filters.topic}
        onChange={(e) => onChange("topic", e.target.value)}
        className="input-field w-auto flex-shrink-0"
        style={{ paddingLeft: "1rem" }}
      >
        <option value="">All Topics</option>
        {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) => onChange("status", e.target.value)}
        className="input-field w-auto flex-shrink-0"
        style={{ paddingLeft: "1rem" }}
      >
        <option value="">All Status</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Add Problem */}
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm tracking-wide transition-opacity hover:opacity-90 btn-gradient flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Problem
      </button>
    </div>
  );
}

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
  const [filters, setFilters] = useState({ search: "", difficulty: "", topic: "", status: "" });
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
    fetchProblems();
  }, [fetchProblems]);

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
    : null;

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

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient-hero)" }}>
      <Navbar onSidebarToggle={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} />

      <main
        className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarOpen ? "220px" : "0px" }}
      >
        <div className="px-6 py-6 max-w-[1400px]">

          {/* ── Header ── */}
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand mb-2">Practice</p>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">DSA Tracker</h1>
            <p className="text-[var(--text-muted)] text-sm mt-2 max-w-xl">
              Track your coding progress, streaks, topic mastery and placement readiness.
            </p>
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
            <div className="flex flex-col gap-5 animate-fade-in">

              {/* 4 Stat cards */}
              <StatsCards stats={stats} />

              {/* Problem Entry */}
              <ProblemEntry filters={filters} onChange={handleFilterChange} onAdd={openAddModal} />

              {/* Analytics grid: LEFT 70% / RIGHT 30% */}
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] gap-5">

                {/* ── Left column ── */}
                <div className="flex flex-col gap-5 min-w-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card title="Where You're Losing Time" titleColor="text-orange-400">
                      <WhereLosingTime problems={problems} />
                    </Card>
                    <Card title="Most Retried Problems" titleColor="text-orange-400">
                      <MostRetried problems={problems} />
                    </Card>
                    <Card title="Difficulty Split" titleColor="text-brand">
                      <DifficultySplit data={dashboard.difficulty} />
                    </Card>
                  </div>

                  <ActivityHeatmap data={dashboard.activity} />

                  <Card title="Weekly Insights" titleColor="text-brand">
                    <WeeklyInsights data={dashboard.weeklyProgress} />
                  </Card>

                  <Card title="Recent Contests" titleColor="text-brand">
                    <RecentContests leetcode={leetcode} contestRating={dashboard.overview.contestRating} />
                  </Card>
                </div>

                {/* ── Right column ── */}
                <div className="flex flex-col gap-5 min-w-0">
                  <CompanyReadiness data={dashboard} />
                  {coachLoading ? <DSACoachLoadingState /> : <AIInsights data={coach} />}
                  <LeetCodeCard data={leetcode} onConnect={handleConnectLeetCode} connecting={leetcodeConnecting} />
                </div>

              </div>

              {/* ── My Problems Table ── */}
              <div className="flex flex-col gap-3 pt-1">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">My Problems</h2>
                <ProblemsTable
                  problems={problems}
                  filters={filters}
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
