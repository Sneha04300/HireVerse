import { useState, useEffect } from "react";

const TOPICS = [
  "Arrays", "Strings", "Hashing", "Linked List", "Stack", "Queue",
  "Trees", "BST", "Graphs", "DP", "Greedy", "Heap", "Trie",
  "Backtracking", "Sliding Window", "Binary Search", "Math", "Bit Manipulation",
];

const PRESET_COMPANIES = [
  "Google", "Amazon", "Microsoft", "Adobe", "Flipkart",
  "Atlassian", "Uber", "Goldman Sachs", "Oracle",
];

function Chip({ label, selected, onClick, onRemove }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
      style={{
        background: selected ? "rgba(6,182,212,0.15)" : "var(--bg-elevated)",
        border: selected ? "0.5px solid rgba(6,182,212,0.4)" : "0.5px solid var(--border)",
        color: selected ? "var(--text-primary)" : "var(--text-secondary)",
      }}
    >
      {label}
      {onRemove && (
        <span className="ml-0.5 text-[var(--text-muted)] hover:text-red-400" onClick={(e) => { e.stopPropagation(); onRemove(); }}>&times;</span>
      )}
    </button>
  );
}

const defaultForm = {
  title: "",
  platform: "LeetCode",
  problemUrl: "",
  difficulty: "Easy",
  topic: [],
  companies: [],
  status: "Solved",
  timeTaken: "",
  attempts: "1",
  notes: "",
  bookmarked: false,
};

export default function ProblemModal({ open, onClose, onSave, problem }) {
  const [form, setForm] = useState(defaultForm);
  const [companyInput, setCompanyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = !!problem;

  useEffect(() => {
    if (problem) {
      setForm({
        title: problem.title || "",
        platform: problem.platform || "LeetCode",
        problemUrl: problem.problemUrl || "",
        difficulty: problem.difficulty || "Easy",
        topic: problem.topic || [],
        companies: problem.companies || [],
        status: problem.status || "Solved",
        timeTaken: problem.timeTaken ?? "",
        attempts: problem.attempts ?? "1",
        notes: problem.notes || "",
        bookmarked: problem.bookmarked || false,
      });
    } else {
      setForm(defaultForm);
    }
    setCompanyInput("");
  }, [problem, open]);

  if (!open) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggleTopic = (t) =>
    setForm((f) => ({
      ...f,
      topic: f.topic.includes(t) ? f.topic.filter((x) => x !== t) : [...f.topic, t],
    }));

  const addCompany = (name) => {
    const c = name.trim();
    if (c && !form.companies.includes(c)) {
      setForm((f) => ({ ...f, companies: [...f.companies, c] }));
    }
    setCompanyInput("");
  };

  const removeCompany = (c) =>
    setForm((f) => ({ ...f, companies: f.companies.filter((x) => x !== c) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        timeTaken: form.timeTaken === "" ? undefined : Number(form.timeTaken),
        attempts: Number(form.attempts),
      };
      await onSave(payload, problem?._id);
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 flex flex-col gap-5"
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {isEdit ? "Edit Problem" : "Add Problem"}
          </h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Problem Title *</label>
            <input
              value={form.title}
              onChange={set("title")}
              required
              placeholder="e.g. Two Sum"
              className="input-field"
            />
          </div>

          {/* Platform + URL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Platform</label>
              <select value={form.platform} onChange={set("platform")} className="input-field">
                {["LeetCode", "GFG", "CodeStudio", "HackerRank", "Other"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Problem URL</label>
              <input value={form.problemUrl} onChange={set("problemUrl")} placeholder="https://..." className="input-field" />
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Difficulty</label>
            <div className="flex gap-2">
              {["Easy", "Medium", "Hard"].map((d) => {
                const colors = {
                  Easy: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", text: "text-green-400" },
                  Medium: { bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.3)", text: "text-yellow-400" },
                  Hard: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", text: "text-red-400" },
                };
                const c = colors[d];
                const active = form.difficulty === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, difficulty: d }))}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${c.text}`}
                    style={{
                      background: active ? c.bg : "var(--bg-elevated)",
                      border: active ? c.border : "0.5px solid var(--border)",
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topics */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Topics</label>
            <div className="flex flex-wrap gap-1.5">
              {TOPICS.map((t) => (
                <Chip key={t} label={t} selected={form.topic.includes(t)} onClick={() => toggleTopic(t)} />
              ))}
            </div>
          </div>

          {/* Companies */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Companies</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_COMPANIES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={form.companies.includes(c)}
                  onClick={() =>
                    form.companies.includes(c) ? removeCompany(c) : addCompany(c)
                  }
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCompany(companyInput); } }}
                placeholder="Type company name and press Enter"
                className="input-field flex-1"
              />
            </div>
            {form.companies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.companies.map((c) => (
                  <Chip key={c} label={c} selected onClick={() => removeCompany(c)} onRemove={() => removeCompany(c)} />
                ))}
              </div>
            )}
          </div>

          {/* Status + Time + Attempts */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Status</label>
              <select value={form.status} onChange={set("status")} className="input-field">
                {["Solved", "Attempted", "Revising"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Time Taken (min)</label>
              <input type="number" min="0" value={form.timeTaken} onChange={set("timeTaken")} placeholder="30" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Attempts</label>
              <input type="number" min="1" value={form.attempts} onChange={set("attempts")} className="input-field" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              rows={3}
              placeholder="Key insights, approach, edge cases..."
              className="input-field resize-none"
            />
          </div>

          {/* Bookmark */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.bookmarked}
              onChange={(e) => setForm((f) => ({ ...f, bookmarked: e.target.checked }))}
              className="w-4 h-4 rounded accent-cyan-500"
            />
            <span className="text-sm text-[var(--text-secondary)]">Bookmark for revision</span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-muted)]" style={{ border: "0.5px solid var(--border)" }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.title.trim()}
              className="px-5 py-2 rounded-xl text-white font-bold text-sm tracking-wide transition-opacity hover:opacity-90 disabled:opacity-50 btn-gradient"
            >
              {saving ? "Saving..." : isEdit ? "Update Problem" : "Add Problem"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
