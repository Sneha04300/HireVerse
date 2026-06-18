import { useState } from "react";

export default function GoalsCard({ goals: initialGoals }) {
  const [goals, setGoals] = useState(initialGoals);
  const completed = goals.filter((g) => g.done).length;

  const toggle = (id) => {
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, done: !g.done } : g));
  };

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Weekly Goals</p>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: "rgba(124,58,237,0.12)", border: "0.5px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}
        >
          {completed}/{goals.length} done
        </span>
      </div>

      <div className="h-1.5 rounded-full" style={{ background: "#1e2535" }}>
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${(completed / goals.length) * 100}%`, background: "linear-gradient(90deg,#7C3AED,#06B6D4)" }}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        {goals.map((g) => (
          <label
            key={g.id}
            className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-[#131826] transition-colors"
          >
            <button
              type="button"
              onClick={() => toggle(g.id)}
              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
              style={{
                background: g.done ? "linear-gradient(135deg,#7C3AED,#06B6D4)" : "transparent",
                border: g.done ? "none" : "1.5px solid #2a3550",
              }}
            >
              {g.done && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className={`text-sm ${g.done ? "text-gray-500 line-through" : "text-gray-200"}`}>
              {g.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
