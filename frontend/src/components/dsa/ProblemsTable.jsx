import { useState, useMemo } from "react";
import { DSAEmptyState } from "./DSAStates";

const STATUS_ICON = {
  Solved: <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />,
  Attempted: <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />,
  Revising: <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />,
};

const DIFF_COLORS = {
  Easy: "text-green-400",
  Medium: "text-yellow-400",
  Hard: "text-red-400",
};

const TOPICS = [
  "Arrays", "Strings", "Hashing", "Linked List", "Stack", "Queue",
  "Trees", "BST", "Graphs", "DP", "Greedy", "Heap", "Trie",
  "Backtracking", "Sliding Window", "Binary Search", "Math", "Bit Manipulation",
];

const STATUSES = ["Solved", "Attempted", "Revising"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const SORT_OPTIONS = ["Newest", "Oldest", "Difficulty"];

function SortIcon({ active, dir }) {
  return (
    <svg className={`w-3.5 h-3.5 ${active ? "text-brand" : "text-[var(--text-muted)]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {dir === "asc" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      )}
    </svg>
  );
}

export default function ProblemsTable({ problems, onEdit, onDelete, onBookmark, onRevision, onAddFirst }) {
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [sort, setSort] = useState("Newest");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => {
    let list = [...problems];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (filterDifficulty) list = list.filter((p) => p.difficulty === filterDifficulty);
    if (filterTopic) list = list.filter((p) => (p.topic || []).includes(filterTopic));
    if (filterStatus) list = list.filter((p) => p.status === filterStatus);
    if (filterCompany) list = list.filter((p) => (p.companies || []).includes(filterCompany));

    const diffRank = { Easy: 0, Medium: 1, Hard: 2 };
    list.sort((a, b) => {
      if (sort === "Newest") return new Date(b.solvedAt || b.createdAt) - new Date(a.solvedAt || a.createdAt);
      if (sort === "Oldest") return new Date(a.solvedAt || a.createdAt) - new Date(b.solvedAt || b.createdAt);
      if (sort === "Difficulty") return diffRank[a.difficulty] - diffRank[b.difficulty];
      return 0;
    });

    return list;
  }, [problems, search, filterDifficulty, filterTopic, filterStatus, filterCompany, sort]);

  if (!problems || problems.length === 0) {
    return <DSAEmptyState onAddFirst={onAddFirst} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search + Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems..."
            className="input-field w-full"
          />
        </div>

        {/* Difficulty filter */}
        <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="input-field w-auto min-w-[100px]">
          <option value="">All Difficulty</option>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Topic filter */}
        <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)} className="input-field w-auto min-w-[100px]">
          <option value="">All Topics</option>
          {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Status filter */}
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-auto min-w-[100px]">
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Sort */}
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field w-auto min-w-[110px]">
          {SORT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "0.5px solid var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg-elevated)" }}>
                <TH>Title</TH>
                <TH>Difficulty</TH>
                <TH>Topic</TH>
                <TH>Status</TH>
                <TH className="text-center">Attempts</TH>
                <TH className="text-center">Bookmark</TH>
                <TH className="text-center">Revisions</TH>
                <TH className="text-center">Actions</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-t border-[var(--border)] transition-colors hover:brightness-110" style={{ background: "var(--bg-card)" }}>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-[var(--text-primary)] font-medium">{p.title}</span>
                      {p.platform && <span className="text-[10px] text-[var(--text-muted)]">{p.platform}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold text-xs ${DIFF_COLORS[p.difficulty]}`}>{p.difficulty}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(p.topic || []).slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)" }}>
                          {t}
                        </span>
                      ))}
                      {(p.topic || []).length > 2 && (
                        <span className="text-[10px] text-[var(--text-muted)]">+{p.topic.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {STATUS_ICON[p.status]}
                      <span className="text-xs text-[var(--text-secondary)]">{p.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--text-secondary)] text-xs">{p.attempts}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => onBookmark(p._id)} className="transition-colors">
                      {p.bookmarked ? (
                        <svg className="w-4 h-4 text-brand" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs text-[var(--text-secondary)]">{p.revisionCount || 0}</span>
                      <button
                        onClick={() => onRevision(p._id)}
                        className="text-[var(--text-muted)] hover:text-brand transition-colors"
                        title="Increment revision"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <ActionBtn onClick={() => onEdit(p)} title="Edit" color="text-brand">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </ActionBtn>
                      <ActionBtn onClick={() => setConfirmDelete(p._id)} title="Delete" color="text-red-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4"
            style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[var(--text-primary)] font-bold text-base">Delete Problem</h3>
            <p className="text-[var(--text-secondary)] text-sm">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-muted)]" style={{ border: "0.5px solid var(--border)" }}>
                Cancel
              </button>
              <button
                onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }}
                className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TH({ children, className = "" }) {
  return (
    <th className={`px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] ${className}`}>
      {children}
    </th>
  );
}

function ActionBtn({ children, onClick, title, color }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-elevated)] ${color}`}
    >
      {children}
    </button>
  );
}
