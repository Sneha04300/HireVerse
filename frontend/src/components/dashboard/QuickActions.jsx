import { useNavigate } from "react-router-dom";

const ACTIONS = [
  {
    id: "resume",
    label: "Scan Resume",
    route: "/resume",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: "ats",
    label: "ATS Check",
    route: null,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    id: "mock",
    label: "Mock Interview",
    route: "/mock-interview",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    id: "leetcode",
    label: "LeetCode",
    route: null,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77l-6.18 3.23L7 14.14 2 9.27l6.91-1.01z" />
      </svg>
    ),
  },
  {
    id: "github",
    label: "GitHub",
    route: null,
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    ),
  },
  {
    id: "dsa",
    label: "DSA",
    route: "/dsa",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
];

export default function QuickActions() {
  const navigate = useNavigate();

  const handleClick = (action) => {
    if (action.route) {
      navigate(action.route);
    } else {
      alert(`${action.label} coming soon`);
    }
  };

  return (
    <div
      className="rounded-2xl p-5 h-full"
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--border)",
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">
        Quick Actions
      </p>

      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => handleClick(a)}
            className="flex flex-col items-center gap-2.5 p-4 rounded-xl text-cyan-400 hover:bg-[var(--bg-hover)] hover:text-cyan-300 transition-all cursor-pointer group"
            style={{
              border: "0.5px solid var(--border)",
            }}
          >
            <span className="group-hover:scale-110 transition-transform">
              {a.icon}
            </span>

            <span className="text-[var(--text-secondary)] text-xs font-medium group-hover:text-[var(--text-primary)] transition-colors">
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}