const GOALS = [
  {
    id: 1,
    title: "Solve 5 DP Problems",
    when: "Today",
    status: "due",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Improve Resume Summary",
    when: "Tomorrow",
    status: "due",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Mock Interview",
    when: "Wed, 10:00",
    status: "scheduled",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
];

const statusStyles = {
  due: { bg: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.35)", color: "#eab308", label: "Due" },
  scheduled: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)", color: "#22c55e", label: "Due" },
};

export default function UpcomingGoals() {
  return (
    <div
      className="rounded-2xl p-5 h-full"
      style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
          Upcoming Goals
        </p>
        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      </div>

      <div className="flex flex-col gap-3">
        {GOALS.map((g) => {
          const s = statusStyles[g.status];
          return (
            <div
              key={g.id}
              className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-[#131826] transition-colors"
              style={{ border: "0.5px solid #1e2535" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "#1a1f2e", color: "#9ca3af" }}
              >
                {g.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold leading-snug">{g.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{g.when}</p>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5"
                style={{ background: s.bg, border: `0.5px solid ${s.border}`, color: s.color }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
