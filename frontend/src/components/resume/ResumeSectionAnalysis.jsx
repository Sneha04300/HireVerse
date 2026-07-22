import { useState } from "react";

function scoreColor(score) {
  if (score >= 90) return "#22c55e";
  if (score >= 70) return "#06B6D4";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

const ICONS = {
  education: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-7-3.5l7 3.5 7-3.5" />
    </svg>
  ),
  skills: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  projects: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
    </svg>
  ),
  experience: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  certifications: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

function SectionCard({ section }) {
  const [open, setOpen] = useState(false);
  const color = scoreColor(section.score);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{ border: `0.5px solid ${open ? "var(--border-focus)" : "var(--border)"}`, background: "var(--bg-card)" }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[var(--bg-hover)] transition-colors"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, color }}
        >
          {ICONS[section.id] || <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        </div>
        <span className="text-[var(--text-primary)] font-semibold text-sm flex-1">{section.label}</span>

        {/* Mini bar */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          <div className="w-24 h-1.5 rounded-full bg-[var(--border)]">
            <div className="h-1.5 rounded-full" style={{ width: `${section.score}%`, background: color }} />
          </div>
          <span className="text-xs font-bold whitespace-nowrap" style={{ color }}>{section.score}</span>
        </div>

        <svg
          className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body */}
      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-[var(--border)]">
          <div className="pt-4">
            <p className="text-[var(--text-tertiary)] text-sm leading-relaxed">{section.feedback}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Suggestions</p>
            {section.suggestions.map((sug, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 7l5 5-5 5" />
                </svg>
                <p className="text-[var(--text-tertiary)] text-sm">{sug}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumeSectionAnalysis({ sections = [] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Section Analysis</p>
          <h3 className="text-[var(--text-primary)] font-bold text-base">Resume Section Breakdown</h3>
        </div>
      </div>
      {sections.map((s) => <SectionCard key={s.id} section={s} />)}
    </div>
  );
}
