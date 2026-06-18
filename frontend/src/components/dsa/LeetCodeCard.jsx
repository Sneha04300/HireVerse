function DiffBar({ label, solved, total, color }) {
  const pct = Math.round((solved / total) * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-bold">{solved}<span className="text-gray-600">/{total}</span></span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "#1e2535" }}>
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function LeetCodeCard({ data }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#1a1f2e", border: "0.5px solid #1e2535" }}
          >
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.535.553-1.386.038-1.901l-2.609-2.636a5.055 5.055 0 00-2.445-1.337l2.467-2.503c.516-.515.498-1.366-.037-1.901-.535-.535-1.386-.553-1.901-.038l-10.1 10.101c-.984.984-1.494 2.296-1.494 3.668 0 1.371.51 2.683 1.494 3.667l4.347 4.347c.984.984 2.296 1.494 3.667 1.494 1.372 0 2.683-.51 3.667-1.494l2.609-2.636c.515-.515.497-1.366-.038-1.901-.535-.535-1.386-.553-1.9-.038z"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm">LeetCode</p>
            <p className="text-gray-500 text-xs">@{data.username}</p>
          </div>
        </div>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: "rgba(34,197,94,0.12)", border: "0.5px solid rgba(34,197,94,0.3)", color: "#22c55e" }}
        >
          Connected
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <DiffBar label="Easy"   solved={data.easy.solved}   total={data.easy.total}   color="#22c55e" />
        <DiffBar label="Medium" solved={data.medium.solved} total={data.medium.total} color="#eab308" />
        <DiffBar label="Hard"   solved={data.hard.solved}   total={data.hard.total}   color="#ef4444" />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="rounded-xl p-3" style={{ background: "#111827", border: "0.5px solid #1e2535" }}>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Acceptance Rate</p>
          <p className="text-white text-lg font-extrabold">{data.acceptanceRate}%</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: "#111827", border: "0.5px solid #1e2535" }}>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Global Rank</p>
          <p className="text-white text-lg font-extrabold">#{data.ranking.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
