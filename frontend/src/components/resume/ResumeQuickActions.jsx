const ACTIONS = [
  {
    id: "reanalyze",
    label: "Reanalyze Resume",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    style: { background: "var(--bg-card-alt)", border: "0.5px solid var(--border)", color: "var(--text-secondary)" },
  },
  {
    id: "download",
    label: "Download Report",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    style: { background: "var(--bg-card-alt)", border: "0.5px solid var(--border)", color: "var(--text-secondary)" },
  },
  {
    id: "compare",
    label: "Compare Previous",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    style: { background: "var(--bg-card-alt)", border: "0.5px solid var(--border)", color: "var(--text-secondary)" },
  },
  {
    id: "generate",
    label: "Generate Improved Resume",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    style: { background: "var(--gradient-brand)", color: "#ffffff", border: "none" },
  },
];

export default function ResumeQuickActions({ onAction }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Quick Actions</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => onAction?.(a.id)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={a.style}
          >
            {a.icon}
            <span className="hidden sm:inline">{a.label}</span>
            <span className="sm:hidden">{a.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
