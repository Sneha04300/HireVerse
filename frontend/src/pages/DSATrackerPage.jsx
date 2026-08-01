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
import "../styles/dsa.css";
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
const SORT_OPTIONS = ["Newest", "Oldest", "Difficulty"];

function Card({ title, titleColor, children, className = "" }) {
  return (
    <div className={`dsa-card p-4 flex flex-col gap-3 ${className}`}>
      <p className={`section-label ${titleColor || "text-[var(--text-muted)]"}`}>{title}</p>
      {children}
    </div>
  );
}

function Select({ value, onChange, options, placeholder, className = "" }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`input-field w-auto flex-shrink-0 ${className}`}
      style={{ paddingLeft: "0.85rem", paddingRight: "1.5rem" }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
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
      <p className="text-[13px] text-[var(--text-muted)]">
        No time data yet. Add time spent per problem to see where your time goes.
      </p>
    );
  }

  const max = Math.max(...rows.map((r) => r.avg), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <div key={r.topic} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--text-primary)]">{r.topic}</span>
            <span className="text-xs font-bold text-[#F59E0B]">{r.avg}m</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: "var(--border)" }}>
            <div className="h-1 rounded-full" style={{ width: `${(r.avg / max) * 100}%`, background: "#F59E0B" }} />
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">
            {r.count} problem{r.count !== 1 ? "s" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function MostRetried({ problems }) {
  const rows = useMemo(
    () =>
      [...problems]
        .filter((p) => (p.revisionCount || 0) > 0 || (p.attempts || 0) > 1)
        .sort((a, b) => (b.revisionCount || 0) - (a.revisionCount || 0) || (b.attempts || 0) - (a.attempts || 0))
        .slice(0, 6),
    [problems]
  );

  if (rows.length === 0) {
    return <p className="text-[13px] text-[var(--text-muted)]">No retried problems yet. Revise problems to build consistency.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((p) => (
        <div key={p._id} className="flex items-center justify-between border-b border-[var(--border)] pb-1.5 last:border-0 last:pb-0">
          <span className="text-[13px] text-[var(--text-secondary)] truncate pr-2">{p.title}</span>
          <span className="text-[11px] font-bold text-[#F59E0B] flex-shrink-0">
            {(p.revisionCount || 0) > 0 ? `${p.revisionCount} revis` : `${p.attempts} att`}
          </span>
        </div>
      ))}
    </div>
  );
}

function WeeklyInsights({ data }) {
  const pct = data?.improvementPercentage || 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[var(--text-tertiary)]">This Week</span>
        <span className="text-[var(--text-primary)] font-bold text-lg leading-none">{data?.solvedThisWeek || 0}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-[var(--text-tertiary)]">Last Week</span>
        <span className="text-[var(--text-secondary)] font-semibold text-lg leading-none">{data?.solvedLastWeek || 0}</span>
      </div>
      <div className="flex justify-between items-center pt-1.5 border-t border-[var(--border)]">
        <span className="text-xs text-[var(--text-tertiary)]">Improvement</span>
        <span className={`font-bold text-lg leading-none ${pct >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
          {pct >= 0 ? "+" : ""}{pct}%
        </span>
      </div>
    </div>
  );
}

function ContestPerformance({ leetcode, contestRating }) {
  const rows = useMemo(() => {
    const contests = leetcode?.recentContests || [];
    return contests.slice(0, 6).map((c, i) => {
      const prev = i > 0 ? contests[i - 1].rating : null;
      const delta = prev != null ? (c.rating || 0) - prev : 0;
      const peak = Math.max(...contests.slice(0, i + 1).map((x) => x.rating || 0));
      return { ...c, delta, peak };
    });
  }, [leetcode]);

  const contests = leetcode?.recentContests || [];

  if (contests.length === 0) {
    return (
      <Card title="Contest Performance" titleColor="text-[var(--text-muted)]" className="h-full">
        <p className="text-[13px] text-[var(--text-muted)]">
          {leetcode
            ? "No recent contest data available."
            : `Current rating ${contestRating || "—"}. Connect LeetCode to see contest history.`}
        </p>
      </Card>
    );
  }

  return (
    <Card title="Contest Performance" titleColor="text-[var(--text-muted)]" className="h-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-[var(--text-tertiary)]">Current Rating</span>
          <span className="text-xl font-extrabold text-[var(--text-primary)] leading-none">{contestRating || "—"}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-[var(--text-tertiary)]">Participated</span>
          <span className="text-xl font-extrabold text-[var(--text-primary)] leading-none">{leetcode?.attendedContestsCount || "—"}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-[var(--border)] pt-2 text-[9px] uppercase tracking-widest font-semibold text-[var(--text-muted)]">
        <span className="flex-1">Contest</span>
        <span className="w-11 text-right">Rank</span>
        <span className="w-9 text-right">Rating</span>
        <span className="w-9 text-right">Peak</span>
        <span className="w-8 text-right">Delta</span>
      </div>
      <div className="flex flex-col">
        {rows.map((c, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 text-xs border-b border-[var(--border)] last:border-0">
            <span className="flex-1 truncate text-[var(--text-primary)] font-medium">{c.title}</span>
            <span className="w-11 text-right text-[var(--text-secondary)]">{c.rank != null ? `#${c.rank}` : "—"}</span>
            <span className="w-9 text-right text-[var(--text-primary)] font-semibold">{c.rating}</span>
            <span className="w-9 text-right text-[var(--text-muted)]">{c.peak}</span>
            <span className={`w-8 text-right font-bold ${c.delta >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
              {c.delta >= 0 ? "+" : ""}{c.delta}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProblemEntry({ filters, onChange, onAdd }) {
  return (
    <div className="dsa-card p-3 flex flex-wrap items-center gap-2.5">
      <div className="relative flex-1 min-w-[200px] flex-shrink-0">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          placeholder="Search problems..."
          className="input-field w-full"
          style={{ paddingLeft: "2.25rem" }}
        />
      </div>
      <Select value={filters.difficulty} onChange={(v) => onChange("difficulty", v)} options={DIFFICULTIES} placeholder="All Difficulty" />
      <Select value={filters.topic} onChange={(v) => onChange("topic", v)} options={TOPICS} placeholder="All Topics" />
      <Select value={filters.status} onChange={(v) => onChange("status", v)} options={STATUSES} placeholder="All Status" />
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 px-4 py-2 text-white font-bold text-[13px] tracking-wide transition-opacity hover:opacity-90 btn-gradient flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
  const [sort, setSort] = useState("Newest");
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
    <div className="dsa-tracker min-h-screen" style={{ background: "var(--bg-gradient-hero)" }}>
      <Navbar onSidebarToggle={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} />

      <main
        className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarOpen ? "220px" : "0px" }}
      >
        <div className="px-6 py-5" style={{ maxWidth: 1650, margin: "auto" }}>
          {/* ── Header ── */}
          <header className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#8B5CF6] mb-1">Practice</p>
              <h1 className="text-[30px] font-extrabold leading-tight text-[var(--text-primary)]">DSA Tracker</h1>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 max-w-xl">
                Track your coding progress, streaks, topic mastery and placement readiness.
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-4 text-white font-bold text-[13px] tracking-wide transition-opacity hover:opacity-90 btn-gradient flex-shrink-0"
              style={{ height: 36 }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Problem
            </button>
          </header>

          {/* ── Loading ── */}
          {loading && <DSALoadingState />}

          {/* ── Error ── */}
          {!loading && error && <DSAErrorState onRetry={fetchDashboard} />}

          {/* ── Empty ── */}
          {!loading && !error && isEmpty && (
            <div className="dsa-card">
              <DSAEmptyState onAddFirst={openAddModal} />
            </div>
          )}

          {/* ── Dashboard ── */}
          {!loading && !error && !isEmpty && dashboard && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* 4 Stat cards */}
              <StatsCards stats={stats} />

              {/* Problem Entry / filter bar */}
              <ProblemEntry filters={filters} onChange={handleFilterChange} onAdd={openAddModal} />

              {/* Analytics grid: LEFT 70% / RIGHT 30% (row 1), then full-width row 2 */}
              <div className="flex flex-col gap-[18px]">
                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] gap-[18px]">
                  {/* Row 1 · left column */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] min-w-0">
                    <Card title="Where You're Losing Time" titleColor="text-[#F59E0B]">
                      <WhereLosingTime problems={problems} />
                    </Card>
                    <ActivityHeatmap data={dashboard.activity} />
                    <CompanyReadiness data={dashboard} />
                  </div>

                  {/* Row 1 · right column */}
                  <div className="flex flex-col gap-[18px] min-w-0">
                    <Card title="Weekly Insights" titleColor="text-[#8B5CF6]">
                      <WeeklyInsights data={dashboard.weeklyProgress} />
                    </Card>
                    <Card title="Most Retried Problems" titleColor="text-[#F59E0B]">
                      <MostRetried problems={problems} />
                    </Card>
                  </div>
                </div>

                {/* Row 2 · full width: Contest | AI Coach | Profile Summary (grows to fill) */}
                <div className="flex flex-col md:flex-row gap-[18px] items-stretch">
                  <div className="md:w-[22%] min-w-0 flex-shrink-0">
                    <ContestPerformance leetcode={leetcode} contestRating={dashboard.overview.contestRating} />
                  </div>
                  <div className="md:w-[22%] min-w-0 flex-shrink-0">
                    {coachLoading ? <DSACoachLoadingState /> : <AIInsights data={coach} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <LeetCodeCard data={leetcode} onConnect={handleConnectLeetCode} connecting={leetcodeConnecting} />
                  </div>
                </div>
              </div>

              {/* ── My Problems ── */}
              <div className="flex flex-col gap-3 pt-1">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">My Problems</h2>

                {/* Toolbar */}
                <div className="dsa-card p-3 flex flex-wrap items-center gap-2.5">
                  <div className="relative flex-1 min-w-[200px] flex-shrink-0">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      placeholder="Search problems..."
                      className="input-field w-full"
                      style={{ paddingLeft: "2.25rem" }}
                    />
                  </div>
                  <Select value={filters.difficulty} onChange={(v) => handleFilterChange("difficulty", v)} options={DIFFICULTIES} placeholder="All Difficulty" />
                  <Select value={filters.topic} onChange={(v) => handleFilterChange("topic", v)} options={TOPICS} placeholder="All Topics" />
                  <Select value={filters.status} onChange={(v) => handleFilterChange("status", v)} options={STATUSES} placeholder="All Status" />
                  <Select value={sort} onChange={setSort} options={SORT_OPTIONS} placeholder="Sort" />
                </div>

                <ProblemsTable
                  problems={problems}
                  filters={filters}
                  sort={sort}
                  onSortChange={setSort}
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
