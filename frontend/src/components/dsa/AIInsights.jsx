import { useState } from "react";

const PRIORITY_COLORS = {
  High: { bg: "rgba(239,68,68,0.15)", text: "text-red-400" },
  Medium: { bg: "rgba(234,179,8,0.15)", text: "text-yellow-400" },
  Low: { bg: "rgba(34,197,94,0.15)", text: "text-green-400" },
};

export default function AIInsights({ data }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const r = data?.recommendations || [];

  if (!data) {
    return (
      <div
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(6,182,212,0.12)", border: "0.5px solid rgba(6,182,212,0.3)" }}>
            <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5L5 3zM19 9l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
            </svg>
          </div>
          <h3 className="text-[var(--text-primary)] font-bold text-sm">AI Coach</h3>
        </div>
        <p className="text-[var(--text-muted)] text-xs">Solve problems to get personalised coaching insights.</p>
      </div>
    );
  }

  return (
    <>
      {/* Card */}
      <div
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(6,182,212,0.12)", border: "0.5px solid rgba(6,182,212,0.3)" }}>
            <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5L5 3zM19 9l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
            </svg>
          </div>
          <h3 className="text-[var(--text-primary)] font-bold text-sm">AI Coach</h3>
        </div>

        {/* Summary */}
        <p className="text-[var(--text-secondary)] text-xs leading-relaxed line-clamp-3">{data.summary}</p>

        {/* Top 3 recs (compact) */}
        {r.length > 0 && (
          <div className="flex flex-col gap-2">
            {r.slice(0, 3).map((rec, i) => {
              const c = PRIORITY_COLORS[rec.priority] || PRIORITY_COLORS.Medium;
              return (
                <div key={i} className="flex items-start gap-2 text-xs" style={{ borderLeft: `2px solid ${c.text === "text-red-400" ? "#ef4444" : c.text === "text-yellow-400" ? "#eab308" : "#22c55e"}`, paddingLeft: "8px" }}>
                  <span className="text-[var(--text-primary)] font-medium flex-1">{rec.title}</span>
                  <span className={`text-[9px] font-bold uppercase ${c.text} flex-shrink-0`}>{rec.priority}</span>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => setDrawerOpen(true)}
          className="w-full py-2 rounded-xl text-xs font-bold tracking-wide transition-opacity hover:opacity-90"
          style={{ background: "rgba(6,182,212,0.1)", border: "0.5px solid rgba(6,182,212,0.3)", color: "#06B6D4" }}
        >
          View Full Report
        </button>
      </div>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDrawerOpen(false)}>
          <div className="fixed inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-md h-full overflow-y-auto p-6 flex flex-col gap-5 animate-slide-in-right"
            style={{ background: "var(--bg-card)", borderLeft: "0.5px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">AI Coach Report</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none">&times;</button>
            </div>

            {/* Summary */}
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{data.summary}</p>

            {/* Strengths */}
            {data.strengths?.length > 0 && (
              <Section title="Strengths" color="text-green-400">
                <div className="flex flex-wrap gap-1.5">
                  {data.strengths.map((s, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.1)", border: "0.5px solid rgba(34,197,94,0.25)", color: "var(--text-primary)" }}>{s}</span>
                  ))}
                </div>
              </Section>
            )}

            {/* Weaknesses */}
            {data.weaknesses?.length > 0 && (
              <Section title="Weaknesses" color="text-red-400">
                <div className="flex flex-wrap gap-1.5">
                  {data.weaknesses.map((w, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.25)", color: "var(--text-primary)" }}>{w}</span>
                  ))}
                </div>
              </Section>
            )}

            {/* Recommendations */}
            {r.length > 0 && (
              <Section title="Recommendations" color="text-brand">
                <div className="flex flex-col gap-2">
                  {r.map((rec, i) => {
                    const c = PRIORITY_COLORS[rec.priority] || PRIORITY_COLORS.Medium;
                    return (
                      <div key={i} className="rounded-xl p-3 flex flex-col gap-1" style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)" }}>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--text-primary)] text-sm font-semibold">{rec.title}</span>
                          <span className={`text-[9px] font-bold uppercase ${c.text}`}>{rec.priority}</span>
                        </div>
                        <p className="text-[var(--text-tertiary)] text-xs">{rec.reason}</p>
                        <p className="text-[var(--text-muted)] text-xs italic">{rec.impact}</p>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Weekly Plan */}
            {data.weeklyPlan?.length > 0 && (
              <Section title="Suggested Weekly Plan" color="text-purple-400">
                <div className="flex flex-col gap-1">
                  {data.weeklyPlan.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-brand font-semibold w-14 flex-shrink-0">{d.day}</span>
                      <span className="text-[var(--text-secondary)]">{d.task}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Prediction */}
            {data.interviewPrediction && (
              <Section title="Interview Prediction" color="text-purple-400">
                <p className="text-[var(--text-secondary)] text-sm">{data.interviewPrediction}</p>
                {data.estimatedReadinessIncrease && (
                  <p className="text-brand font-bold text-sm mt-1">{data.estimatedReadinessIncrease}</p>
                )}
              </Section>
            )}

            {/* Motivation */}
            {data.motivationalTip && (
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                <svg className="w-4 h-4 text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c-1 3-4 5-4 9a4 4 0 008 0c0-1-.5-2-1-3 1 .5 2.5 2 2.5 4.5A5.5 5.5 0 0112 18a5.5 5.5 0 01-5.5-5.5C6.5 8 9 5 12 2z" />
                </svg>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed">{data.motivationalTip}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, color, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className={`text-[11px] font-bold uppercase tracking-widest ${color}`}>{title}</p>
      {children}
    </div>
  );
}
